import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Phone, Loader2 } from 'lucide-react';
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
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden max-w-lg w-full">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-10 text-center">
                    <User className="w-20 h-20 text-white rounded-full p-2 bg-white/10 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">{user.firstname} {user.lastname}</h1>
                    <p className="text-blue-100 mt-2">{user.role}</p>
                </div>
                <div className="p-6 space-y-4">
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
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

