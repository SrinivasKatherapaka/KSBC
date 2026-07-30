import express from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { calculateLoanRisk, analyzeDefaulterRisk, detectTransactionFraud, customerServiceChat, cfoExecutiveChat, executeAiWorkflow, generatePredictiveAnalytics, generateIntelligentReport } from '../services/gemini.service.js';
import { db } from '../config/db.js';

const router = express.Router();

// Mock Initial Defaulters & Fraud Datasets
const defaultNpaList = [
  { id: 'def-101', borrowerName: 'Titan Retail Logistics', originalPrincipal: 4500000, remainingBalance: 3800000, daysPastDue: 75, missedPayments: 3, collateralType: 'Commercial Real Estate', status: 'SMA-2' },
  { id: 'def-102', borrowerName: 'Katherapaka Srinivas (Private Wealth)', originalPrincipal: 1200000, remainingBalance: 950000, daysPastDue: 45, missedPayments: 2, collateralType: 'Investment Portfolio', status: 'SMA-1' },
  { id: 'def-103', borrowerName: 'AeroSystems Manufacturing', originalPrincipal: 8500000, remainingBalance: 7200000, daysPastDue: 110, missedPayments: 4, collateralType: 'Factory Automation Equipment', status: 'Substandard NPA' },
  { id: 'def-104', borrowerName: 'Solstice Solar Corp', originalPrincipal: 3200000, remainingBalance: 2900000, daysPastDue: 62, missedPayments: 2, collateralType: 'Solar Grid Infrastructure', status: 'SMA-2' }
];

const defaultFraudAlerts = [
  { transactionId: 'TX-FRD-9901', accountNumber: 'KSBC-CORP-90004912', accountHolder: 'Apex Industrial Corp', amount: 850000, transactionType: 'International Wire Transfer', location: 'Zurich, Switzerland (Overseas)', IPAddress: '185.220.101.5', timeOfDay: '03:14 AM EST', averageTransactionAmount: 45000, fraudScore: 88, riskTag: 'HIGH_RISK_FRAUD', status: 'UNREVIEWED' },
  { transactionId: 'TX-FRD-9902', accountNumber: 'KSBC-SAV-10001492', accountHolder: 'Katherapaka Srinivas', amount: 145000, transactionType: 'Rapid ACH Outflow', location: 'London, UK', IPAddress: '194.26.29.11', timeOfDay: '02:45 AM EST', averageTransactionAmount: 12000, fraudScore: 76, riskTag: 'HIGH_RISK_FRAUD', status: 'UNREVIEWED' },
  { transactionId: 'TX-FRD-9903', accountNumber: 'KSBC-HNW-50003819', accountHolder: 'Alexander Sterling', amount: 250000, transactionType: 'Crypto Gateway Transfer', location: 'Cayman Islands', IPAddress: '103.251.170.8', timeOfDay: '11:22 PM EST', averageTransactionAmount: 65000, fraudScore: 68, riskTag: 'SUSPICIOUS', status: 'REVIEWING' }
];

// 1. POST /api/ai/loan-risk (AI Loan Risk Calculator)
router.post('/loan-risk', authenticateJWT, async (req, res) => {
  try {
    const riskResult = await calculateLoanRisk(req.body);
    return res.json({ success: true, assessment: riskResult });
  } catch (err) {
    console.error('Error in AI loan risk endpoint:', err);
    return res.status(500).json({ success: false, error: 'AI Loan risk calculation failed' });
  }
});

// 2. GET /api/ai/defaulters (Retrieve active NPA Defaulters list)
router.get('/defaulters', authenticateJWT, async (req, res) => {
  try {
    return res.json({ success: true, defaulters: defaultNpaList });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve defaulters' });
  }
});

// 3. POST /api/ai/defaulters/analyze (Run Gemini AI Defaulter NPA Workout Strategy)
router.post('/defaulters/analyze', authenticateJWT, async (req, res) => {
  try {
    const workoutStrategy = await analyzeDefaulterRisk(req.body);
    return res.json({ success: true, strategy: workoutStrategy });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Defaulter risk analysis failed' });
  }
});

// 4. GET /api/ai/fraud-transactions (Retrieve active Fraudulent Transaction Alerts)
router.get('/fraud-transactions', authenticateJWT, async (req, res) => {
  try {
    return res.json({ success: true, fraudAlerts: defaultFraudAlerts });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve fraud alerts' });
  }
});

// 5. POST /api/ai/fraud-detection/analyze (Analyze Transaction Fraud)
router.post('/fraud-detection/analyze', authenticateJWT, async (req, res) => {
  try {
    const fraudAnalysis = await detectTransactionFraud(req.body);
    return res.json({ success: true, fraudAnalysis });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Fraud detection analysis failed' });
  }
});

// 6. POST /api/ai/customer-service/chat (24/7 AI Customer Service Chatbot)
router.post('/customer-service/chat', authenticateJWT, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const customerList = await db.getCustomers();
    const reply = await customerServiceChat(message, history || [], customerList);
    return res.json({ success: true, ...reply });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Customer service AI chatbot failed' });
  }
});

// 8. POST /api/ai/cfo-chat (Executive CFO AI Chatbot & Metric Intelligence)
router.post('/cfo-chat', authenticateJWT, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Query message is required' });
    }

    const glAccounts = await db.getGlAccounts();
    const loans = await db.getLoans();
    const customers = await db.getCustomers();

    const disbursedLoans = loans.filter(l => l.status === 'disbursed');
    const totalDisbursedAmount = disbursedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);

    const approvedLoans = loans.filter(l => l.status === 'approved');
    const totalApprovedAmount = approvedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);

    const pendingLoans = loans.filter(l => l.status !== 'disbursed' && l.status !== 'rejected');
    const totalPendingAmount = pendingLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);

    const totalLoansAmount = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
    const totalCustomerDeposits = customers.reduce((sum, c) => sum + Number(c.annual_revenue || 0), 0);

    const vaultCash = glAccounts.find(a => a.account_code === '1010')?.balance || 50000000;
    const loanPortfolio = glAccounts.find(a => a.account_code === '1200')?.balance || (totalDisbursedAmount || 42850000);
    const customerDeposits = glAccounts.find(a => a.account_code === '2010')?.balance || totalCustomerDeposits;

    const financialContext = {
      vaultCash,
      loanPortfolio: totalDisbursedAmount || loanPortfolio,
      customerDeposits,
      totalLoansCount: loans.length,
      totalLoansAmount,
      totalDisbursedCount: disbursedLoans.length,
      totalDisbursedAmount,
      totalApprovedCount: approvedLoans.length,
      totalApprovedAmount,
      totalPendingCount: pendingLoans.length,
      totalPendingAmount,
      totalCustomersCount: customers.length
    };

    const reply = await cfoExecutiveChat(message, history || [], financialContext);

    // Audit log CFO session
    await db.logAiSession(req.user.id, 'cfo_executive_query', message, reply);

    return res.json({ success: true, ...reply });
  } catch (err) {
    console.error('Error in CFO AI endpoint:', err);
    return res.status(500).json({ success: false, error: 'CFO AI Assistant failed' });
  }
});

// 7. GET /api/ai/sessions (Audit Log History)
router.get('/sessions', authenticateJWT, async (req, res) => {
  try {
    const sessions = await db.getAiSessions(req.user.id);
    return res.json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch AI sessions' });
  }
});

// 9. POST /api/ai/workflow/execute (AI Workflow Automation Trigger)
router.post('/workflow/execute', authenticateJWT, async (req, res) => {
  try {
    const { workflowType, targetId, parameters } = req.body;
    if (!workflowType) {
      return res.status(400).json({ success: false, error: 'workflowType is required' });
    }

    const result = await executeAiWorkflow({ workflowType, targetId, parameters });
    await db.logAiSession(req.user.id, 'workflow_automation', `Workflow Trigger: ${workflowType}`, result);

    return res.json({ success: true, result });
  } catch (err) {
    console.error('Error executing AI Workflow:', err);
    return res.status(500).json({ success: false, error: 'Failed to execute AI workflow' });
  }
});

// 10. POST /api/ai/predictive-analytics (AI Predictive Analytics & Stress Testing)
router.post('/predictive-analytics', authenticateJWT, async (req, res) => {
  try {
    const { forecastMonths = 12, scenario = 'baseline' } = req.body;

    const [loans, customers, glAccounts] = await Promise.all([
      db.getLoans(),
      db.getCustomers(),
      db.getGlAccounts()
    ]);

    const activeDisbursedLoans = loans.filter(l => l.status === 'disbursed');
    const totalDisbursedAmount = activeDisbursedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
    const totalCustomerDeposits = customers.reduce((sum, c) => sum + Number(c.annual_revenue || 0), 0);

    const financialContext = {
      totalDisbursedAmount: totalDisbursedAmount || 55060000,
      customerDeposits: totalCustomerDeposits || 314980000
    };

    const analytics = await generatePredictiveAnalytics({ forecastMonths, scenario, financialContext });
    return res.json({ success: true, analytics });
  } catch (err) {
    console.error('Error generating predictive analytics:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate predictive analytics' });
  }
});

// 11. POST /api/ai/intelligent-reporting/generate (AI Intelligent Reporting Synthesis)
router.post('/intelligent-reporting/generate', authenticateJWT, async (req, res) => {
  try {
    const { reportType = 'EXECUTIVE_FINANCIAL_SUMMARY', period = 'Q3 2026' } = req.body;

    const [loans, customers, glAccounts] = await Promise.all([
      db.getLoans(),
      db.getCustomers(),
      db.getGlAccounts()
    ]);

    const activeDisbursedLoans = loans.filter(l => l.status === 'disbursed');
    const totalDisbursedAmount = activeDisbursedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
    const totalCustomerDeposits = customers.reduce((sum, c) => sum + Number(c.annual_revenue || 0), 0);
    const vaultCash = glAccounts.find(a => a.account_code === '1010')?.balance || 50000000;

    const financialContext = {
      vaultCash,
      totalDisbursedAmount: totalDisbursedAmount || 55060000,
      customerDeposits: totalCustomerDeposits || 314980000
    };

    const report = await generateIntelligentReport({ reportType, period, financialContext });
    await db.logAiSession(req.user.id, 'intelligent_reporting', `Report Generated: ${reportType}`, report);

    return res.json({ success: true, report });
  } catch (err) {
    console.error('Error generating intelligent report:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate intelligent report' });
  }
});

// 12. POST /api/ai/assistant (General AI ERP Assistant)
router.post('/assistant', authenticateJWT, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const customerList = await db.getCustomers();
    const reply = await customerServiceChat(message, [], customerList);
    return res.json({
      success: true,
      aiResponse: {
        answer: reply.message,
        suggestedActions: (reply.suggestedTopics || []).map(t => ({ label: t, action: t }))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'AI ERP Assistant failed' });
  }
});

export default router;
