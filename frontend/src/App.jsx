import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import CustomersPage from './pages/CustomersPage';
import CompliancePage from './pages/CompliancePage';
import LoanCalculatorPage from './pages/LoanCalculatorPage';
import LoansPage from './pages/LoansPage';
import LoansDatabasePage from './pages/LoansDatabasePage';
import FreshLoanApplicationsPage from './pages/FreshLoanApplicationsPage';
import DefaultersPage from './pages/DefaultersPage';
import FraudDetectionPage from './pages/FraudDetectionPage';
import CustomerServicePage from './pages/CustomerServicePage';
import TreasuryPage from './pages/TreasuryPage';
import FinancePage from './pages/FinancePage';
import ProcurementPage from './pages/ProcurementPage';
import WorkflowAutomationPage from './pages/WorkflowAutomationPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import IntelligentReportingPage from './pages/IntelligentReportingPage';
import AiAssistantPage from './pages/AiAssistantPage';
import AdvisoryHistoryPage from './pages/AdvisoryHistoryPage';
import CfoAiAssistantPage from './pages/CfoAiAssistantPage';
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
          <Route path="/accounts/:id" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
          <Route path="/accounts/details/:id" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
          <Route path="/fresh-loans" element={<ProtectedRoute><FreshLoanApplicationsPage /></ProtectedRoute>} />
          <Route path="/loan-applications" element={<ProtectedRoute><FreshLoanApplicationsPage /></ProtectedRoute>} />
          <Route path="/loans-database" element={<ProtectedRoute><LoansDatabasePage /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
          <Route path="/loan-calculator" element={<ProtectedRoute><LoanCalculatorPage /></ProtectedRoute>} />
          <Route path="/defaulters" element={<ProtectedRoute><DefaultersPage /></ProtectedRoute>} />
          <Route path="/fraud-detection" element={<ProtectedRoute><FraudDetectionPage /></ProtectedRoute>} />
          <Route path="/customer-service" element={<ProtectedRoute><CustomerServicePage /></ProtectedRoute>} />
          <Route path="/treasury" element={<ProtectedRoute><TreasuryPage /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute><ProcurementPage /></ProtectedRoute>} />
          <Route path="/workflow-automation" element={<ProtectedRoute><WorkflowAutomationPage /></ProtectedRoute>} />
          <Route path="/predictive-analytics" element={<ProtectedRoute><PredictiveAnalyticsPage /></ProtectedRoute>} />
          <Route path="/intelligent-reporting" element={<ProtectedRoute><IntelligentReportingPage /></ProtectedRoute>} />
          <Route path="/cfo-ai-chat" element={<ProtectedRoute><CfoAiAssistantPage /></ProtectedRoute>} />
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
