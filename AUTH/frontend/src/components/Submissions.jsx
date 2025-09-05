import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user?.token) {
                    setError('You must be logged in to view submissions.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('/api/submissions', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setSubmissions(response.data);
            } catch (err) {
                console.error('Error fetching submissions:', err);
                setError('Failed to fetch submissions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const getResultColor = (result) => {
        switch (result) {
            case 'Accepted':
                return 'text-green-400 bg-green-900/20';
            case 'Wrong Answer':
                return 'text-red-400 bg-red-900/20';
            case 'Time Limit Exceeded':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'Runtime Error':
                return 'text-orange-400 bg-orange-900/20';
            case 'Compilation Error':
                return 'text-purple-400 bg-purple-900/20';
            default:
                return 'text-gray-400 bg-gray-900/20';
        }
    };

    const getResultBadge = (result) => {
        const colorClass = getResultColor(result);
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorClass} border border-current/20`}>
                {result}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Loading submissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-red-400 text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-slate-300 text-xl font-semibold mb-2">No Submissions Yet</h3>
                        <p className="text-slate-400">Start solving problems to see your submissions here!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-8">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Submissions</h1>
                                <p className="text-blue-100 mt-2">Track your coding progress and results</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{submissions.length}</div>
                                <div className="text-blue-100 text-sm">Total Submissions</div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                                        Problem
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                                        Language
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                                        Runtime
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">
                                        Submitted
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {submissions.map((submission, index) => (
                                    <tr 
                                        key={submission._id} 
                                        className="hover:bg-slate-700/30 transition-all duration-200 group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-2 h-8 bg-blue-500 rounded-full mr-4 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                                <div>
                                                    <div className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                        {submission.problemId?.title || 'Unknown Problem'}
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getResultBadge(submission.result)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                                    {submission.language}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-300">
                                                {submission.executionTime ? (
                                                    <span className="font-mono">
                                                        {submission.executionTime}ms
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">N/A</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-400">
                                                {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(submission.submittedAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Submissions;