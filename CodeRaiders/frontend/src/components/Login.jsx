import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// import authService from '../services/authService'; // 👈 1. You no longer need this here
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth(); // 👈 You are already getting the login function correctly
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 👇 2. Replace the authService call with the login function from context
            await login(email, password);

            toast.success("Login successful!");
            navigate('/dashboard');

        } catch (error) {
            // The context's login function will throw an error if the API call fails
            console.error("Login failed: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        // ... your beautiful JSX remains exactly the same
        <div className="flex items-center justify-center p-4 relative overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: '1rem' }}>
            {/* Galaxy theme gradient background */}
            <div className="absolute" style={{ top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0a0a0a, #1a0b2e, #16213e, #0f3460, #533a7d, #8b5a8c, #b06ab3, #d084c7)' }}></div>

            {/* Additional galaxy overlay with stars effect */}
            <div className="absolute" style={{ top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.15), transparent 50%), radial-gradient(ellipse at 40% 40%, rgba(120, 119, 255, 0.1), transparent 50%)' }}></div>

            {/* Blurred glassmorphism container */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">Code Raiders</h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <button type="submit" className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white font-semibold hover:from-indigo-950 hover:via-blue-900 hover:to-purple-950 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                        Login
                    </button>
                </form>

                {/* Sign up link */}
                <div className="mt-8 text-center">
                    <p className="text-white/70 text-sm">
                        Don't have an account?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-300 hover:underline cursor-pointer"
                        >
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;