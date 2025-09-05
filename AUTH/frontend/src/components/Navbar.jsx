import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload(); // Reloads the page to log the user out
    };

    return (
        <nav className="relative z-20 bg-black/20 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo - now a clickable link */}
                    <Link to="/dashboard" className="logo-card cursor-pointer">
                        <div className="logo-5">
                            <div className="terminal"></div>
                            <span className="brand-text text-xl font-bold text-white">Code Raiders</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/userprofile" className="text-white/80 hover:text-white transition-colors duration-300">Profile</Link>
                        <Link to="/problemlist" className="text-white hover:text-white font-medium">Problems</Link>
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
                        {/* Logout button for authenticated users */}
                        {localStorage.getItem('user') && (
                            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200">
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;