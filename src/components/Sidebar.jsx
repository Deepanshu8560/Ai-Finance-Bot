import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    MessageSquare,
    PieChart,
    Calculator,
    Target,
    BookOpen,
    Menu,
    X,
    Wallet,
    LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const menuItems = [
        { name: 'Chat Assistant', icon: <MessageSquare size={20} />, path: '/' },
        { name: 'Expense Analyzer', icon: <PieChart size={20} />, path: '/expense-analyzer' },
        { name: 'Budget Planner', icon: <Calculator size={20} />, path: '/budget-planner' },
        { name: 'Goal Planning', icon: <Target size={20} />, path: '/goal-planning' },
        { name: 'Investment Mode', icon: <BookOpen size={20} />, path: '/investment-explainer' },
        { name: 'Memory', icon: <Wallet size={20} />, path: '/memory-settings' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg md:hidden text-gray-600 hover:text-blue-600"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <AnimatePresence mode='wait'>
                {(isOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.3 }}
                        className={`
              fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 
              flex flex-col shadow-xl md:shadow-none md:translate-x-0 md:static
              ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
                    >
                        {/* Logo Area */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                            <div className="bg-blue-600 p-2 rounded-lg mr-3">
                                <Wallet className="text-white" size={24} />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                FinBot
                            </h1>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                    className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <span className={`mr-3 transition-colors ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.name}</span>
                                </NavLink>
                            ))}
                        </nav>

                        {/* Footer / User Info */}
                        <div className="p-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="truncate">
                                    <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center px-4 py-2 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
