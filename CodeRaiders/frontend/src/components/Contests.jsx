import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Plus, Users } from 'lucide-react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

import useAuth from '../hooks/useAuth';

const getStatusColor = (status) => {
    switch (status) {
        case 'Live':
            return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
        case 'Upcoming':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        case 'Ended':
            return 'bg-slate-700/40 text-slate-400 border-slate-600';
        default:
            return 'bg-slate-700/40 text-slate-400 border-slate-600';
    }
};

const formatContestTime = (date) => {
    if (!date) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleString('en-US', options);
};

const Contests = () => {
    const [contests, setContests] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { auth } = useAuth();
    const apiPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await apiPrivate.get('/api/contests');
                setContests(response.data);
            } catch (err) {
                setError('Failed to fetch contests. Please try again.');
                console.error('Error fetching contests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, [apiPrivate]);

    const filteredContests = contests.filter(c => {
        if (activeTab === 'All') return true;
        return c.status === activeTab;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Loading contests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
            <div className="w-full max-w-6xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            Coding Contests
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Compete with programmers worldwide and prove your algorithms mastery</p>
                    </div>
                    {auth.user?.role === 'admin' && (
                        <Link to="/contests/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                            <Plus className="w-5 h-5" />
                            Create Contest
                        </Link>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
                    {['All', 'Live', 'Upcoming', 'Ended'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredContests.length > 0 ? (
                        filteredContests.map((contest) => (
                            <div
                                key={contest._id}
                                className="bg-slate-800/90 border border-slate-700/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-slate-600"
                            >
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {contest.title}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                                                {contest.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                            {contest.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                <span>
                                                    {contest.status === 'Ended' ? 'Ended' : 'Starts'}: {formatContestTime(contest.startTime)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-purple-400" />
                                                <span>{contest.participantsCount || 0} participants</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Link
                                            to={`/contests/${contest._id}`}
                                            className={`font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 block text-center shadow-lg ${
                                                contest.status === 'Live'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                                                    : contest.status === 'Upcoming'
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                            }`}
                                        >
                                            {contest.status === 'Ended' ? 'View Leaderboard' : contest.status === 'Live' ? 'Enter Contest' : 'Register / View Details'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
                            <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Contests Found</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">
                                There are no {activeTab !== 'All' ? activeTab.toLowerCase() : ''} contests available right now. Check back soon!
                            </p>
                            {auth.user?.role === 'admin' && (
                                <Link to="/contests/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 mx-auto w-fit">
                                    <Plus className="w-5 h-5" />
                                    Create a New Contest
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contests;
