
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Import the new CSS file
import useAxiosPrivate from '../hooks/useAxiosPrivate';
const Dashboard = () => {
    const apiPrivate = useAxiosPrivate(); // 👈 Get the special Axios instance

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Use the private instance for your API call 🚀
                const response = await apiPrivate.get('/dashboard');
                console.log(response.data);
            } catch (error) {
                console.error("Could not fetch dashboard data", error);
            }
        };

        fetchUserData();
    }, [apiPrivate]);
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
            {/* Galaxy theme gradient background */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, #0a0a0a, #1a0b2e, #16213e, #0f3460, #533a7d, #8b5a8c, #b06ab3, #d084c7)'
            }}></div>

            {/* Additional galaxy overlay with stars effect */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.15), transparent 50%), radial-gradient(ellipse at 40% 40%, rgba(120, 119, 255, 0.1), transparent 50%)'
            }}></div>

            {/* Navbar */}
            <nav className="relative z-20 bg-black/20 backdrop-blur-lg border-b border-white/10 w-full">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="logo-card">
                            <div className="logo-5">
                                <div className="terminal"></div>
                                <span className="brand-text">Code Raiders</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/userprofile" className="text-white/80 hover:text-white transition-colors duration-300">Profile</Link>
                            <Link to="/problems" className="text-white hover:text-white font-medium">Problems</Link>
                            <Link to="/submissions" className="text-white/80 hover:text-white transition-colors duration-300">Submissions</Link>
                            <Link to="/contests" className="text-white/80 hover:text-white transition-colors duration-300">Contests</Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg border border-white/20 transition-all duration-300 backdrop-blur-sm">
                                Login
                            </Link>
                            <Link to="/register" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg border border-white/20 transition-all duration-300 backdrop-blur-sm">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content - Full screen below navbar */}
            <div className="relative z-10 w-full h-[calc(100vh-88px)] flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-4xl">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">
                            Welcome to the Dashboard
                        </h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            This is a protected page after successful login.
                        </p>
                        {/* Additional dashboard content */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Correct Link usage: Link wraps the clickable div */}
                            <Link to="/userprofile" className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-semibold text-white mb-2">Profile</h3>
                                <p className="text-white/70">Track your performance metrics</p>
                            </Link>
                            <Link to="/problems" className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-semibold text-white mb-2">Problems</h3>
                                <p className="text-white/70">Manage and view coding problems</p>
                            </Link>
                            <Link to="/submissions" className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-semibold text-white mb-2">Submissions</h3>
                                <p className="text-white/70">View your past submissions</p>
                            </Link>
                            <Link to="/contests" className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-semibold text-white mb-2">Contests</h3>
                                <p className="text-white/70">Participate in coding contests</p>
                            </Link>
                        </div>

                        {/* Action button */}
                        <div className="mt-8">
                            <Link to="/problems" className="block">
                                <button className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white font-semibold hover:from-indigo-950 hover:via-blue-900 hover:to-purple-950 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;