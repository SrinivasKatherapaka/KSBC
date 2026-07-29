import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import complianceRoutes from './routes/compliance.routes.js';
import loanRoutes from './routes/loan.routes.js';
import treasuryRoutes from './routes/treasury.routes.js';
import financeRoutes from './routes/finance.routes.js';
import procurementRoutes from './routes/procurement.routes.js';
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root & API Base Health Info Handler
app.get(['/', '/api', '/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    bank: 'KSBC Digital Banking ERP Platform',
    timestamp: new Date().toISOString(),
    version: '2.5.0',
    model: 'gemini-2.5-flash',
    endpoints: {
      auth: '/api/auth/login',
      customers: '/api/customers',
      compliance: '/api/compliance/verify-doc',
      loans: '/api/loans',
      treasury: '/api/treasury/reserves',
      finance: '/api/finance/ledger',
      procurement: '/api/procurement/pos',
      ai: '/api/ai/assistant'
    }
  });
});

// Dual API Route Mounting (Supports both /api/* and /* routes)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/customers', customerRoutes);
app.use('/customers', customerRoutes);

app.use('/api/compliance', complianceRoutes);
app.use('/compliance', complianceRoutes);

app.use('/api/loans', loanRoutes);
app.use('/loans', loanRoutes);

app.use('/api/treasury', treasuryRoutes);
app.use('/treasury', treasuryRoutes);

app.use('/api/finance', financeRoutes);
app.use('/finance', financeRoutes);

app.use('/api/procurement', procurementRoutes);
app.use('/procurement', procurementRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// 404 Handler
app.use((req, res) => {
  console.warn(`[404 NOT FOUND] ${req.method} ${req.url}`);
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 KSBC Digital Banking ERP Backend running on http://localhost:${PORT}`);
});
