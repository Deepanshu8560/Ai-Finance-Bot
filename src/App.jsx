import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ChatInterface from './components/ChatInterface';
import ExpenseAnalyzer from './pages/ExpenseAnalyzer';
import BudgetPlanner from './pages/BudgetPlanner';
import GoalPlanner from './pages/GoalPlanner';
import InvestmentExplainer from './pages/InvestmentExplainer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MemorySettings from './pages/MemorySettings';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ChatInterface />} />
            <Route path="expense-analyzer" element={<ExpenseAnalyzer />} />
            <Route path="budget-planner" element={<BudgetPlanner />} />
            <Route path="goal-planning" element={<GoalPlanner />} />
            <Route path="investment-explainer" element={<InvestmentExplainer />} />
            <Route path="memory-settings" element={<MemorySettings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
