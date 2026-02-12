import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            await googleLogin(credentialResponse.credential);
            navigate('/');
        } catch (err) {
            console.error('Google Login Error:', err);
            setError('Google Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
            >
                <div className="text-center mb-6">
                    <div className="bg-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                        <UserPlus className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-2">Start your journey to financial freedom</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center mb-6 text-sm">
                        <AlertCircle size={16} className="mr-2" />
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={(error) => {
                            console.error('Google Login UI Error:', error);
                            setError('Google Login Failed');
                        }}
                        useOneTap
                        text="signup_with"
                    />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : "Sign Up"}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
