import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import CustomersPage from './pages/CustomersPage';
import CompliancePage from './pages/CompliancePage';
import LoanCalculatorPage from './pages/LoanCalculatorPage';
import LoansPage from './pages/LoansPage';
import TreasuryPage from './pages/TreasuryPage';
import FinancePage from './pages/FinancePage';
import ProcurementPage from './pages/ProcurementPage';
import AiAssistantPage from './pages/AiAssistantPage';
import AdvisoryHistoryPage from './pages/AdvisoryHistoryPage';
import ProfilePage from './pages/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
          <Route path="/loan-calculator" element={<ProtectedRoute><LoanCalculatorPage /></ProtectedRoute>} />
          <Route path="/loan-applications" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
          <Route path="/treasury" element={<ProtectedRoute><TreasuryPage /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute><ProcurementPage /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
          <Route path="/advisory-history" element={<ProtectedRoute><AdvisoryHistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Default Route Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
