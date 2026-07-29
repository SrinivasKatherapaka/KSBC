import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/finance/ledger
router.get('/ledger', authenticateJWT, requireRole(['finance_manager', 'cfo_executive', 'treasury_manager', 'admin']), async (req, res) => {
  try {
    const accounts = await db.getGlAccounts();
    const transactions = await db.getTransactions();

    const totalDebits = transactions.reduce((sum, t) => sum + Number(t.debit_amount), 0);
    const totalCredits = transactions.reduce((sum, t) => sum + Number(t.credit_amount), 0);

    return res.json({
      success: true,
      ledger: {
        accounts,
        transactions,
        auditSummary: {
          totalDebits,
          totalCredits,
          isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
        }
      }
    });
  } catch (err) {
    console.error('Error fetching finance ledger:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch General Ledger data' });
  }
});

export default router;
