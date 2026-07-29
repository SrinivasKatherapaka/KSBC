import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { LedgerService } from '../services/ledger.service.js';

const router = Router();

// POST /api/loans/:id/disburse (Treasury Fund Disbursement)
router.post('/loans/:id/disburse', authenticateJWT, requireRole(['treasury_manager', 'admin']), async (req, res) => {
  try {
    const loan = await db.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Loan must be approved before Treasury disbursement' });
    }

    // Check Treasury reserves
    const glAccounts = await db.getGlAccounts();
    const vaultCash = glAccounts.find(a => a.account_code === '1010');
    const cashReserveBalance = Number(vaultCash ? vaultCash.balance : 0);

    if (cashReserveBalance < Number(loan.principal_amount)) {
      return res.status(400).json({
        success: false,
        error: `Insufficient Vault Cash Reserves. Available: $${cashReserveBalance.toLocaleString()}, Required: $${Number(loan.principal_amount).toLocaleString()}`
      });
    }

    // 1. Update loan status to disbursed
    const updatedLoan = await db.updateLoanStatus(req.params.id, 'disbursed', null, req.user.id);

    // 2. Automated Double-Entry GL Ledger Postings
    const transactions = await LedgerService.disburseLoanLedgerPosting(updatedLoan, req.user.id);

    return res.json({
      success: true,
      message: 'Treasury disbursement authorized. Double-entry GL postings completed successfully.',
      loan: updatedLoan,
      glTransactions: transactions
    });
  } catch (err) {
    console.error('Treasury Disbursement Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to authorize Treasury disbursement' });
  }
});

// GET /api/treasury/reserves
router.get('/reserves', authenticateJWT, requireRole(['treasury_manager', 'cfo_executive', 'finance_manager', 'admin']), async (req, res) => {
  try {
    const accounts = await db.getGlAccounts();
    const vaultCash = accounts.find(a => a.account_code === '1010')?.balance || 0;
    const loanPortfolio = accounts.find(a => a.account_code === '1200')?.balance || 0;
    const customerDeposits = accounts.find(a => a.account_code === '2010')?.balance || 0;

    const loans = await db.getLoans();
    const activeDisbursedLoans = loans.filter(l => l.status === 'disbursed');
    const totalDisbursedAmount = activeDisbursedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);

    return res.json({
      success: true,
      metrics: {
        vaultCashReserves: Number(vaultCash),
        loanPortfolioBalance: Number(loanPortfolio),
        customerDeposits: Number(customerDeposits),
        totalDisbursedLoansCount: activeDisbursedLoans.length,
        totalDisbursedAmount,
        capitalAdequacyRatio: '18.4%' // Baseline metrics
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch treasury metrics' });
  }
});

export default router;
