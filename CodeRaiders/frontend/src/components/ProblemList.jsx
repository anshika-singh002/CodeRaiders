import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, Code, Clock, Users, Filter, ServerCrash } from 'lucide-react';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const apiPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await apiPrivate.get('/api/problems');
                setProblems(response.data);
            } catch (err) {
                setError('Failed to fetch problems. Please try again.');
                console.error('Error fetching problems:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [apiPrivate]);

    useEffect(() => {
        let filtered = problems.filter(problem => {
            const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
            const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
            return matchesSearch && matchesDifficulty;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title': return a.title.localeCompare(b.title);
                case 'difficulty':
                    const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                    return order[a.difficulty] - order[b.difficulty];
                case 'acceptance': return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
                case 'newest':
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        setFilteredProblems(filtered);
    }, [problems, searchTerm, difficultyFilter, sortBy]);

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await apiPrivate.delete(`/api/problems/${id}`);
                setProblems(problems.filter(problem => problem._id !== id));
            } catch (err) {
                setError('Failed to delete problem: ' + (err.response?.data?.message || err.message));
                console.error('Error deleting problem:', err);
            }
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-900/20 border-green-400/30';
            case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
            case 'Hard': return 'text-red-400 bg-red-900/20 border-red-400/30';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
        }
    };

    const formatNumber = (num) => {
        if (typeof num !== 'number') return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Loading problems...</p>
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
                            <ServerCrash className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                                    <Code className="w-8 h-8" />
                                    Problem Bank
                                </h1>
                                <p className="text-indigo-100 mt-1 sm:mt-2">Master your coding skills with challenging problems</p>
                            </div>
                            {auth.user && auth.user.role === 'admin' && (
                                <Link to="/problems/new" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-white/20">
                                    <Plus className="w-5 h-5" />
                                    Create Problem
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-slate-700 border-b border-slate-700">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search problems by title, description, or tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="relative">
                                    <select
                                        value={difficultyFilter}
                                        onChange={(e) => setDifficultyFilter(e.target.value)}
                                        className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                                    >
                                        <option value="All">All Difficulties</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                    <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="title">Title A-Z</option>
                                    <option value="difficulty">Difficulty</option>
                                    <option value="acceptance">Acceptance Rate</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <p className="text-slate-400">
                        Showing {filteredProblems.length} of {problems.length} problems
                    </p>
                </div>

                {filteredProblems.length > 0 ? (
                    <div className="space-y-4">
                        {filteredProblems.map((problem) => (
                            <div
                                key={problem._id}
                                className="bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:ring-2 hover:ring-blue-500/50"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link to={`/problems/${problem._id}`} className="flex items-center gap-3">
                                                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                        {problem.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </Link>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                                {problem.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {problem.tags && problem.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md border border-slate-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{formatNumber(problem.submissions)} submissions</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{problem.acceptanceRate || 0}% acceptance</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link to={`/problems/${problem._id}/submit`}>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                                                    Solve
                                                </button>
                                            </Link>
                                            {auth.user && auth.user.role === 'admin' && (
                                                <>
                                                    <Link to={`/problems/edit/${problem._id}`}>
                                                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors duration-200">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleDelete(problem._id, problem.title); }}
                                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl p-12 text-center">
                        <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No Problems Found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchTerm || difficultyFilter !== 'All'
                                ? "Try adjusting your search criteria or filters."
                                : "Get started by creating your first problem!"}
                        </p>
                        {auth.user && auth.user.role === 'admin' && (
                            <Link to="/problems/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto w-fit">
                                <Plus className="w-5 h-5" />
                                Create First Problem
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProblemList;

