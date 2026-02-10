import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Note: react-dropzone not installed in plan, using manual input + PapaParse directly or native drag/drop if simple
import Papa from 'papaparse';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyzeExpenses } from '../services/ai';

const ExpenseAnalyzer = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        setError(null);
        setResult(null);

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const csvText = Papa.unparse(results.data);
                const apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;

                if (!apiKey) {
                    setError("Please configure your Groq API Key in Settings first.");
                    setAnalyzing(false);
                    return;
                }

                try {
                    const analysis = await analyzeExpenses(apiKey, csvText);
                    setResult(analysis);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setAnalyzing(false);
                }
            },
            error: (err) => {
                setError("Failed to parse CSV file.");
                setAnalyzing(false);
            }
        });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Expense Analyzer</h1>
                <p className="text-gray-600 mt-2">Upload your bank statement (CSV) to get AI-powered insights.</p>
            </header>

            {/* File Upload Section */}
            {!result && !analyzing && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors cursor-pointer relative"
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Upload className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload CSV Statement</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Click or drag file to this area to upload.</p>
                </motion.div>
            )}

            {/* Loading State */}
            {analyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-900">Analyzing your finances...</h3>
                    <p className="text-gray-500">Our AI is categorizing transactions and finding patterns.</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center">
                    <AlertTriangle className="mr-3" />
                    {error}
                </div>
            )}

            {/* Results Dashboard */}
            {result && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                            <p className="text-3xl font-bold text-gray-900">₹{result.total_spent}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Income</p>
                            <p className="text-3xl font-bold text-green-600">₹{result.total_income}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Net Flow</p>
                            <p className={`text-3xl font-bold ${result.total_income - result.total_spent >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                ₹{(result.total_income - result.total_spent).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Spending Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={result.categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {result.categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Insights & Risky Spending */}
                        <div className="space-y-6">
                            {/* AI Insights */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                                    <FileText className="mr-2" size={20} /> AI Insights
                                </h3>
                                <ul className="space-y-3">
                                    {result.insights.map((insight, idx) => (
                                        <li key={idx} className="flex items-start text-indigo-800">
                                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Risky Checks */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <CheckCircle className="mr-2 text-green-500" size={20} /> Risk Assessment
                                </h3>
                                {result.risky_spending && result.risky_spending.length > 0 ? (
                                    <div className="space-y-3">
                                        {result.risky_spending.map((item, idx) => (
                                            <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start">
                                                <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">{item.description} - ₹{item.amount}</p>
                                                    <p className="text-xs text-red-600">{item.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No risky or unusual transactions detected. Good job!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => setResult(null)}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Upload Another Statement
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExpenseAnalyzer;
