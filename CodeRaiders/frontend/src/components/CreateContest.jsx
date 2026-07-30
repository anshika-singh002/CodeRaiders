import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { Trophy, Calendar, Clock, CheckSquare, Square, ArrowLeft } from 'lucide-react';

const CreateContest = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [problems, setProblems] = useState([]);
    const [selectedProblemIds, setSelectedProblemIds] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [fetchingProblems, setFetchingProblems] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const apiPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await apiPrivate.get('/api/problems');
                setProblems(response.data);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
                setError("Failed to load problem bank.");
            } finally {
                setFetchingProblems(false);
            }
        };
        fetchProblems();
    }, [apiPrivate]);

    const toggleProblemSelection = (id) => {
        if (selectedProblemIds.includes(id)) {
            setSelectedProblemIds(selectedProblemIds.filter(item => item !== id));
        } else {
            setSelectedProblemIds([...selectedProblemIds, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedProblemIds.length === 0) {
            setError('Please select at least one problem for the contest.');
            return;
        }

        if (new Date(startTime) >= new Date(endTime)) {
            setError('End time must be after start time.');
            return;
        }

        setLoading(true);

        try {
            await apiPrivate.post('/api/contests', {
                title,
                description,
                startTime,
                endTime,
                problems: selectedProblemIds
            });
            navigate('/contests');
        } catch (err) {
            console.error("Error creating contest:", err);
            setError(err.response?.data?.message || 'Failed to create contest.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/contests')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Contests
                </button>

                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
                    <div className="bg-slate-800 border-b border-slate-700/60 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                                <Trophy className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Create New Contest</h1>
                                <p className="text-sm text-slate-400 mt-0.5">Setup a timed coding competition for your platform users</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-6 sm:mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Contest Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Code Raiders Sprint #10"
                                required
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide contest rules, duration highlights, or prizes..."
                                rows="3"
                                required
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Problem Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Select Problems ({selectedProblemIds.length} selected)
                            </label>

                            {fetchingProblems ? (
                                <div className="p-8 text-center text-slate-400">Loading problem bank...</div>
                            ) : problems.length === 0 ? (
                                <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 text-sm">
                                    No problems available in problem bank. Add problems first.
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 divide-y divide-slate-800">
                                    {problems.map((p) => {
                                        const isSelected = selectedProblemIds.includes(p._id);
                                        return (
                                            <div
                                                key={p._id}
                                                onClick={() => toggleProblemSelection(p._id)}
                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                                    isSelected ? 'bg-blue-600/20 text-white border border-blue-500/40' : 'hover:bg-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                    )}
                                                    <span className="font-medium text-sm">{p.title}</span>
                                                </div>
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                                                    p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {p.difficulty}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/contests')}
                                className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating Contest...' : 'Publish Contest'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateContest;
