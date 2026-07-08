import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Phone, Loader2, BadgeCheck, TerminalSquare } from 'lucide-react';
import useAxiosPrivate from '../hooks/useAxiosPrivate'; // Correct hook for private API calls

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiPrivate = useAxiosPrivate(); // Get the configured Axios instance

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Use 'apiPrivate' to make the API call.
                // This automatically uses the correct baseURL (http://localhost:4000)
                // and attaches the Authorization header.
                const response = await apiPrivate.get('/api/users/profile');
                setUser(response.data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to fetch user profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [apiPrivate]); // Dependency array ensures this runs once

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full text-center text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full text-center text-gray-400">
                    User data not available.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
                    <User className="w-20 h-20 text-white rounded-full p-2 bg-white/10 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">{user.firstname} {user.lastname}</h1>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${user.role === 'admin' ? 'bg-white/15 text-white' : 'bg-white/10 text-blue-50'}`}>
                            <BadgeCheck className="w-4 h-4" />
                            {user.role}
                        </span>
                    </div>
                </div>
                <div className="p-8 space-y-5">
                    <div className="flex items-center space-x-4">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-slate-400">Email Address</p>
                            <p className="text-base text-white">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-slate-400">Phone Number</p>
                            <p className="text-base text-white">{user.phoneno}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-slate-400">User Role</p>
                            <p className="text-base text-white">{user.role}</p>
                        </div>
                    </div>

                    {user.role === 'admin' && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                            <div className="flex items-center gap-3">
                                <TerminalSquare className="w-5 h-5 text-blue-300" />
                                <div>
                                    <p className="font-semibold text-white">Admin access enabled</p>
                                    <p className="text-sm text-blue-100/80">You can create and edit problems from the admin workspace.</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link to="/admin/problems/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                                    Add Problem
                                </Link>
                                <Link to="/problems" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800">
                                    Browse Problems
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
