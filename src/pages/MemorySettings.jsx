import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MemorySettings = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMemories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/memory');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            const data = await response.json();
            setMemories(data);
        } catch (err) {
            setError(err.message || "Could not connect to the database. Make sure the backend server is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/memory/${id}`, { method: 'DELETE' });
            setMemories(memories.filter(m => m.id !== id));
        } catch (err) {
            console.error("Failed to delete memory", err);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to forget everything? This cannot be undone.")) return;
        try {
            await fetch('/api/memory', { method: 'DELETE' });
            setMemories([]);
        } catch (err) {
            console.error("Failed to clear memories", err);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Conversation Memory</h1>
                    <p className="text-gray-600 mt-2">Manage what the AI remembers about you.</p>
                </div>
                <button
                    onClick={fetchMemories}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <RefreshCw size={24} />
                </button>
            </header>

            {error ? (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center text-amber-800">
                    <Server className="mr-4 flex-shrink-0" size={32} />
                    <div>
                        <h3 className="font-bold text-lg">Backend Not Connected</h3>
                        <p className="mb-2">{error}</p>
                        <p className="text-sm opacity-80">
                            To enable memory, you must run the backend server:<br />
                            <code className="bg-amber-100 px-2 py-1 rounded mt-1 inline-block">node server/index.js</code>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Database className="mr-2 text-purple-600" size={24} />
                                Stored Context ({memories.length})
                            </h2>
                            {memories.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Clear All Data
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading memories...</div>
                        ) : memories.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Database className="mx-auto mb-3 opacity-20" size={48} />
                                <p>No memories stored yet.</p>
                                <p className="text-sm mt-1">Chat with the bot to build context.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {memories.map((mem) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={mem.id}
                                        className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                    >
                                        <div>
                                            <span className="inline-block px-2 py-1 bg-white text-xs font-bold text-gray-500 rounded border border-gray-200 mb-2">
                                                {mem.category}
                                            </span>
                                            <p className="text-gray-800">{mem.content}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(mem.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(mem.id)}
                                            className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemorySettings;
