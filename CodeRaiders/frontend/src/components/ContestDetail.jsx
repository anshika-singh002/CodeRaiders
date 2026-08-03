import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useAuth } from "../context/AuthContext";
import { Trophy, Clock, Code, Award, Loader2, Users, ArrowLeft, CalendarClock, CheckCircle } from 'lucide-react';

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'Easy':   return 'bg-green-500/10 text-green-400 border-green-500/30';
        case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
        case 'Hard':   return 'bg-red-500/10 text-red-400 border-red-500/30';
        default:       return 'bg-slate-700 text-slate-300 border-slate-600';
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Live':     return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
        case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        case 'Ended':    return 'bg-slate-700/40 text-slate-400 border-slate-600';
        default:         return 'bg-slate-700/40 text-slate-400 border-slate-600';
    }
};

const useCountdown = (targetDate, status) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!targetDate || status === 'Ended') return;

        const update = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                return;
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate, status]);

    return timeLeft;
};

const ContestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('problems');
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    const fetchContest = useCallback(async () => {
        try {
            const [cRes, lRes] = await Promise.all([
                apiPrivate.get(`/api/contests/${id}`),
                apiPrivate.get(`/api/contests/${id}/leaderboard`)
            ]);
            setContest(cRes.data);
            setLeaderboard(lRes.data);

            // Check if current user is already a participant
            const userId = auth?.user?.id || auth?.user?._id;
            if (userId && cRes.data.participants) {
                setHasJoined(cRes.data.participants.some(p =>
                    (p._id || p) === userId || (p._id || p).toString() === userId.toString()
                ));
            }
        } catch (err) {
            setError('Could not load contest details.');
        } finally {
            setLoading(false);
        }
    }, [id, apiPrivate, auth]);

    useEffect(() => {
        fetchContest();
    }, [fetchContest]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            await apiPrivate.post(`/api/contests/${id}/join`);
            setHasJoined(true);
            setContest(prev => ({
                ...prev,
                participants: [...(prev.participants || []), auth.user.id]
            }));
        } catch (err) {
            console.error('Failed to join contest:', err);
        } finally {
            setJoining(false);
        }
    };

    const countdownTarget = contest?.status === 'Live' ? contest.endTime : contest?.startTime;
    const countdownLabel = contest?.status === 'Live' ? 'Ends in' : 'Starts in';
    const timeLeft = useCountdown(countdownTarget, contest?.status);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-900">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
    );
    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-red-400 gap-4">
            <span>{error}</span>
            <button onClick={() => navigate('/contests')} className="text-blue-400 hover:underline text-sm">← Back to Contests</button>
        </div>
    );

    const rankMedals = ['🥇', '🥈', '🥉'];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Back button */}
                <button onClick={() => navigate('/contests')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Contests
                </button>

                {/* Header Card */}
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold">{contest?.title}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(contest?.status)}`}>
                                    {contest?.status}
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">{contest?.description}</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="w-4 h-4 text-blue-400" />
                                    <span>Start: {new Date(contest?.startTime).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-red-400" />
                                    <span>End: {new Date(contest?.endTime).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <span>{contest?.participants?.length || 0} participants</span>
                                </div>
                            </div>
                        </div>

                        {/* Countdown + Join */}
                        <div className="flex-shrink-0 text-center">
                            {contest?.status !== 'Ended' && timeLeft && (
                                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-3 min-w-[180px]">
                                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest">{countdownLabel}</p>
                                    <p className="text-xl font-mono font-bold text-white tracking-wider">{timeLeft}</p>
                                </div>
                            )}

                            {contest?.status === 'Live' && !hasJoined && (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {joining ? 'Joining...' : '⚡ Enter Contest'}
                                </button>
                            )}
                            {contest?.status === 'Upcoming' && !hasJoined && (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {joining ? 'Registering...' : 'Register Now'}
                                </button>
                            )}
                            {hasJoined && (
                                <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                    <CheckCircle className="w-5 h-5" />
                                    Registered
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700/60 gap-1">
                    {[
                        { key: 'problems', label: 'Problems', icon: Code },
                        { key: 'leaderboard', label: 'Leaderboard', icon: Trophy }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`pb-3 px-5 font-semibold flex items-center gap-2 border-b-2 transition-all text-sm ${
                                activeTab === key
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* Problems Tab */}
                {activeTab === 'problems' && (
                    <div className="space-y-3">
                        {contest?.problems?.length > 0 ? (
                            contest.problems.map((prob, idx) => (
                                <div
                                    key={prob._id}
                                    className="bg-slate-800/90 border border-slate-700/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-500 transition-all"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-slate-500 text-sm font-mono">#{idx + 1}</span>
                                            <h3 className="text-base font-semibold text-white">{prob.title}</h3>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getDifficultyColor(prob.difficulty)}`}>
                                                {prob.difficulty}
                                            </span>
                                        </div>
                                        {prob.tags && prob.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {prob.tags.map((tag, i) => (
                                                    <span key={i} className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-400 rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/problems/${prob._id}/submit`}
                                        className={`flex-shrink-0 font-semibold py-2 px-5 rounded-lg text-sm transition-all ${
                                            contest?.status === 'Live'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : contest?.status === 'Upcoming'
                                                ? 'bg-slate-700 text-slate-300 cursor-not-allowed pointer-events-none'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                        }`}
                                    >
                                        {contest?.status === 'Live' ? 'Solve' : contest?.status === 'Upcoming' ? 'Locked' : 'View Solution'}
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 bg-slate-800/60 border border-slate-700/50 p-10 rounded-xl text-center">
                                No problems listed for this contest yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h2 className="font-bold text-white">Contest Leaderboard</h2>
                            <span className="text-xs text-slate-500 ml-auto">{leaderboard.length} participants ranked</span>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Rank</th>
                                    <th className="px-6 py-3">Participant</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Submissions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((entry, index) => (
                                        <tr key={index} className={`transition-colors ${index === 0 ? 'bg-yellow-500/5' : 'hover:bg-slate-700/20'}`}>
                                            <td className="px-6 py-4 font-bold text-lg">
                                                {index < 3 ? rankMedals[index] : <span className="text-slate-400 text-sm">#{index + 1}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-white">
                                                    {entry.user?.firstname
                                                        ? `${entry.user.firstname} ${entry.user.lastname || ''}`.trim()
                                                        : entry.user?.email || 'Anonymous'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-green-400">{entry.totalScore || 0} pts</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">{entry.submissionsCount || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No submissions yet</p>
                                            <p className="text-sm text-slate-500 mt-1">Be the first to solve a problem and claim the top spot!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDetail;
