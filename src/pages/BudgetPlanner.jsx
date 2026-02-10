import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Calculator, Target, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateBudgetPlan } from '../services/ai';

const BudgetPlanner = () => {
    const [formData, setFormData] = useState({
        income: '',
        fixedCosts: '',
        goals: ''
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

    const handleGeneratePlan = async (e) => {
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

        if (!formData.income || !formData.fixedCosts) {
            setError("Please enter at least your Income and Fixed Costs.");
            setLoading(false);
            return;
        }

        try {
            const result = await generateBudgetPlan(apiKey, formData);
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
                <h1 className="text-3xl font-bold text-gray-900">Smart Budget Planner</h1>
                <p className="text-gray-600 mt-2">Plan your finances using the 50/30/20 rule optimized by AI.</p>
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
                            <Calculator className="mr-2 text-blue-600" size={24} />
                            Your Details
                        </h2>

                        <form onSubmit={handleGeneratePlan} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Approx Income (₹)</label>
                                <input
                                    type="number"
                                    name="income"
                                    value={formData.income}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 5000"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Monthly Costs (₹)</label>
                                <input
                                    type="number"
                                    name="fixedCosts"
                                    value={formData.fixedCosts}
                                    onChange={handleInputChange}
                                    placeholder="Rent, Bills, etc."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">Rent, Utilities, Insurance, Minimum Debt Payments</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Goals</label>
                                <textarea
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Save for a house down payment, Pay off credit card debt..."
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start">
                                    <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : "Generate Plan"}
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
                            {/* Analysis Summary */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-start">
                                    <TrendingUp className="mr-3 mt-1" size={24} />
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Budget Analysis</h3>
                                        <p className="text-blue-100 leading-relaxed">{plan.analysis}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Chart */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 self-start">Appropriate Allocations</h3>
                                    <div className="w-full h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={plan.allocations}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {plan.allocations.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => `₹${value}`} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Breakdown Details */}
                                <div className="space-y-4">
                                    {plan.allocations.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800 flex items-center">
                                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold" style={{ color: item.color }}>${item.value}</p>
                                                <p className="text-xs text-gray-400">Target</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Plan */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <Target className="mr-2 text-green-600" size={24} />
                                    Action Plan
                                </h3>
                                <div className="space-y-3">
                                    {plan.action_plan.map((action, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <CheckCircle className="mr-3 text-green-500 mt-0.5 flex-shrink-0" size={20} />
                                            <p className="text-gray-700">{action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                                <Calculator className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No Plan Generated Yet</h3>
                            <p className="text-gray-500 max-w-sm mt-2">Enter your financial details on the left to get a personalized AI-powered budget plan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetPlanner;
