import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phoneno: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.register(
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password,
                formData.phoneno

            );
            console.log("Registration successful!");
            toast.success("Registration successful! You can now log in.");
            navigate('/login');
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error("Registration failed: " + errorMessage);
        }
    };


    return (
        <div className="flex items-center justify-center p-4 relative overflow-hidden" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: '1rem'}}>
            {/* Vibrant JWST Pillars of Creation inspired galaxy background */}
            <div className="absolute" style={{top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0a0a0a, #1a0b2e, #16213e, #0f3460, #533a7d, #8b5a8c, #b06ab3, #d084c7)'}}></div>

            {/* Cosmic nebula overlay with JWST-style vibrant colors */}
            <div className="absolute" style={{top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.15), transparent 50%), radial-gradient(ellipse at 40% 40%, rgba(120, 119, 255, 0.1), transparent 50%)'}}></div>

            {/* Additional stellar dust layer */}
            <div className="absolute" style={{top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at 40% 10%, rgba(255, 183, 0, 0.15), transparent 30%), radial-gradient(circle at 60% 90%, rgba(220, 47, 2, 0.15), transparent 25%), radial-gradient(circle at 10% 50%, rgba(0, 29, 61, 0.2), transparent 35%)'}}></div>

            {/* Blurred glassmorphism container */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">Code Raiders</h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <input
                        type="text"
                        name="phoneno"
                        value={formData.phoneno}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className="p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                    />
                    <button type="submit" className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white font-semibold hover:from-indigo-950 hover:via-blue-900 hover:to-purple-950 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                        Register
                    </button>
                </form>
                
                {/* Sign in link */}
                <div className="mt-8 text-center">
                    <p className="text-white/70 text-sm">
                        Already have an account?{' '}
                        <span 
                            onClick={() => navigate('/login')}
                            className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-300 hover:underline cursor-pointer"
                        >
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;