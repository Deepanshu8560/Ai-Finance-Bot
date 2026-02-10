import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, AlertTriangle, Check, Loader, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainInvestmentConcept } from '../services/ai';

const InvestmentExplainer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);
        setExplanation(null);

        const apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            setError("Please configure your Groq API Key in Settings first.");
            setLoading(false);
            return;
        }

        try {
            const result = await explainInvestmentConcept(apiKey, searchTerm);
            setExplanation(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const suggestedTerms = ["SIP", "Mutual Fund", "ETF", "Stocks", "Fixed Deposit", "Cryptocurrency", "Inflation"];

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Investment Knowledge Hub</h1>
                <p className="text-gray-600 mt-2">Ask about any financial concept, and get a simple, practical explanation.</p>
            </header>

            {/* Search Section */}
            <div className="relative max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="What is SIP? What are Bonds?..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <button
                        type="submit"
                        disabled={loading || !searchTerm.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : "Explain"}
                    </button>
                </form>

                {/* Suggestions */}
                {!explanation && !loading && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {suggestedTerms.map(term => (
                            <button
                                key={term}
                                onClick={() => { setSearchTerm(term); handleSearch({ preventDefault: () => { } }); }}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="mr-2" size={20} />
                    {error}
                </div>
            )}

            {/* Content Display */}
            <AnimatePresence mode='wait'>
                {explanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Definition Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span
                                    className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
                                    style={{ backgroundColor: explanation.risk_color || '#9CA3AF' }}
                                >
                                    Risk: {explanation.risk_level}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{explanation.term}</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">{explanation.definition}</p>
                        </div>

                        {/* Example & Takeaways Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Example Card */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                    <TrendingUp className="mr-2" size={20} /> Example Scenario
                                </h3>
                                <p className="text-blue-800 mb-4 italic">"{explanation.example.scenario}"</p>

                                <div className="space-y-2 bg-white/60 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">You Invest</span>
                                        <span className="font-semibold text-gray-900">{explanation.example.invested_amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Final Value</span>
                                        <span className="font-bold text-green-600 text-lg">{explanation.example.final_value}</span>
                                    </div>
                                    {explanation.example.gain && (
                                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                            <span className="text-gray-600">Total Gain</span>
                                            <span className="font-bold text-blue-600">{explanation.example.gain}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Takeaways Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <BookOpen className="mr-2 text-purple-600" size={20} /> Key Takeaways
                                </h3>
                                <ul className="space-y-3">
                                    {explanation.takeaways.map((point, idx) => (
                                        <li key={idx} className="flex items-start text-gray-700">
                                            <Check className="mr-3 text-green-500 mt-1 flex-shrink-0" size={16} />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="flex items-center justify-center text-xs text-gray-400 mt-8">
                            <Info size={14} className="mr-1" />
                            <span>AI-generated content for educational purposes only. Not financial advice.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InvestmentExplainer;
