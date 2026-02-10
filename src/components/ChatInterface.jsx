import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import { generateResponse } from '../services/ai';
import { useAuth } from '../context/AuthContext';

const ChatInterface = () => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your AI Financial Assistant. I can help you with budgeting, investing, banking, and more.\n\nHow can I assist you today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const envKey = import.meta.env.VITE_GROQ_API_KEY;
        const storedKey = localStorage.getItem('groq_api_key');

        if (envKey) {
            setApiKey(envKey);
        } else if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    // Fetch Chat History on Load
    useEffect(() => {
        if (user && token) {
            const fetchHistory = async () => {
                try {
                    const response = await fetch('/api/chat', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const history = await response.json();
                        if (history.length > 0) {
                            setMessages(history);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch chat history:", error);
                }
            };
            fetchHistory();
        }
    }, [user, token]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const saveMessageToDb = async (role, content) => {
        if (!user || !token) return;
        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role, content })
            });
        } catch (error) {
            console.error("Failed to save message:", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Save User Message
        saveMessageToDb('user', userMessage.content);

        try {
            const history = messages;

            const responseText = await generateResponse(apiKey, messages, input);

            const aiResponse = {
                role: 'assistant',
                content: responseText
            };

            setMessages(prev => [...prev, aiResponse]);

            // Save AI Message
            saveMessageToDb('assistant', aiResponse.content);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please check your connection or API key."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">AI Financial Assistant</h1>
                        <p className="text-sm text-gray-500">Your personal finance guide</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-blue-600"
                    title="Settings"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-gray-900' : 'bg-blue-600'
                                    }`}>
                                    {message.role === 'user' ? (
                                        <User className="w-5 h-5 text-white" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-white" />
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className={`p-4 rounded-2xl shadow-sm ${message.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <div className="prose prose-sm max-w-none break-words">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className={`mb-2 last:mb-0 ${message.role === 'user' ? 'text-gray-100' : 'text-gray-800'}`} {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-current" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                                <span className="text-gray-500 text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 md:p-6">
                <div className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={apiKey ? "Ask about budgeting, investing, or savings..." : "Please configure API Key in settings..."}
                        className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-900 placeholder-gray-400 disabled:opacity-75 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                    AI can make mistakes. Please verify important financial information.
                </p>
            </div>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={(key) => setApiKey(key)}
            />
        </div>
    );
};

export default ChatInterface;
