import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload(); // Reloads the page to log the user out
    };

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-white/5 shadow-lg">
            <div className="w-full px-4 md:px-6 py-2.5">
                <div className="flex items-center justify-start md:justify-between gap-4">
                    {/* Logo - now a clickable link */}
                    <Link to="/dashboard" className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-base">⚡</span>
                            </div>
                            <span className="text-base font-bold text-white hidden sm:inline whitespace-nowrap">Code Raiders</span>
                        </div>
                    </Link>

                    {/* Navigation Links - centered */}
                    <div className="hidden md:flex items-center flex-1 justify-center">
                        <div className="flex items-center space-x-0.5">
                            <Link to="/userprofile" className="px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap">Profile</Link>
                            <Link to="/problems" className="px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap">Problems</Link>
                            <Link to="/submissions" className="px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap">Submissions</Link>
                            <Link to="/contests" className="px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 whitespace-nowrap">Contests</Link>
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {!localStorage.getItem('user') && (
                            <>
                                <Link to="/login" className="hidden sm:inline-block text-white/70 hover:text-white px-3 py-2 rounded-md text-xs md:text-sm font-medium hover:bg-white/10 transition-all duration-200 whitespace-nowrap">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
                                    Register
                                </Link>
                            </>
                        )}
                        {/* Logout button for authenticated users */}
                        {localStorage.getItem('user') && (
                            <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-md transition-all duration-200 hover:shadow-lg">
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