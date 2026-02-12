import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
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
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
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
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <LogIn className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to continue your financial journey</p>
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
                    />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                        Create one
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
