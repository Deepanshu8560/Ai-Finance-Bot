import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Target, TrendingUp, Shield, Clock, CheckCircle, Loader, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateGoalStrategy } from '../services/ai';

const GoalPlanner = () => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        years: '',
        risk: 'Medium'
    });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateStrategy = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPlan(null);

        const apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            setError("Please configure your Groq API Key in Settings first.");
            setLoading(false);
            return;
        }

        if (!formData.name || !formData.amount || !formData.years) {
            setError("Please fill in all goal fields.");
            setLoading(false);
            return;
        }

        try {
            const result = await generateGoalStrategy(apiKey, formData);
            setPlan(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Goal-Based Planning</h1>
                <p className="text-gray-600 mt-2">Define your dreams, and let AI build the investment roadmap.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <Target className="mr-2 text-blue-600" size={24} />
                            Goal Details
                        </h2>

                        <form onSubmit={handleGenerateStrategy} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Buy a Tesla, Europe Trip"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 50000"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon (Years)</label>
                                <input
                                    type="number"
                                    name="years"
                                    value={formData.years}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 5"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Appetite</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Low', 'Medium', 'High'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, risk: level }))}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${formData.risk === level
                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : "Build Strategy"}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {plan ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <DollarSign className="text-green-100" size={24} />
                                        <h3 className="text-lg font-medium text-green-50">Monthly Savings</h3>
                                    </div>
                                    <p className="text-4xl font-bold">${plan.monthly_savings_required}</p>
                                    <p className="text-sm text-green-100 mt-2">Required to reach your goal in {formData.years} years</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <TrendingUp size={20} />
                                        <span className="text-sm font-medium">Est. Annual Return</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{plan.estimated_return_rate}</p>
                                    <p className="text-sm text-gray-400 mt-1">Based on {formData.risk} risk profile</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Chart */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 self-start">Recommended Split</h3>
                                    <div className="w-full h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={plan.investment_split}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="percentage"
                                                >
                                                    {plan.investment_split.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => `${value}%`} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Strategy Logic */}
                                <div className="flex flex-col space-y-4">
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                                            <Shield className="mr-2" size={20} /> Strategy Logic
                                        </h3>
                                        <p className="text-blue-800 leading-relaxed text-sm">{plan.strategy_logic}</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                                        <ul className="space-y-3">
                                            {plan.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-600">
                                                    <CheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" size={16} />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Clock className="text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-gray-900">Start Planning</h3>
                            <p className="text-gray-500 max-w-sm mt-2">Define your goal to get a customized savings and investment roadmap.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoalPlanner;
