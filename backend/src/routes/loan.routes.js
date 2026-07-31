import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateRequest, createLoanSchema } from '../middleware/validate.js';
import { GeminiService } from '../services/gemini.service.js';

const router = Router();

// GET /api/loans
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const loans = await db.getLoans();
    return res.json({ success: true, loans });
  } catch (err) {
    console.error('Error fetching loans:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch loans' });
  }
});

// GET /api/loans/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const loan = await db.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan application not found' });
    return res.json({ success: true, loan });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch loan details' });
  }
});

// POST /api/loans (Create loan application)
router.post('/', authenticateJWT, requireRole(['customer_ops', 'loan_officer', 'finance_manager', 'cfo_executive', 'admin']), validateRequest(createLoanSchema), async (req, res) => {
  try {
    const { customerId, applicantName, applicantCategory, principalAmount, interestRate, termMonths, purpose, status } = req.body;

    let targetCustomerId = customerId;
    let targetApplicantName = applicantName;

    if (customerId) {
      const customer = (await db.getCustomers()).find(c => c.id === customerId);
      if (customer && !targetApplicantName) {
        targetApplicantName = `${customer.first_name} ${customer.last_name}`;
      }
    }

    if (!targetCustomerId && (await db.getCustomers()).length > 0) {
      targetCustomerId = (await db.getCustomers())[0].id;
    }

    const newLoan = await db.createLoan({
      customer_id: targetCustomerId,
      applicant_name: targetApplicantName || 'Private Account Holder',
      applicant_category: applicantCategory || 'private_individual',
      principal_amount: principalAmount,
      interest_rate: interestRate,
      term_months: termMonths,
      purpose,
      status: status || 'applied',
      created_by: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Loan application created successfully',
      loan: newLoan
    });
  } catch (err) {
    console.error('Error creating loan:', err);
    return res.status(500).json({ success: false, error: 'Failed to create loan application' });
  }
});

// POST /api/loans/:id/assess-risk (Run Gemini Risk Model)
router.post('/:id/assess-risk', authenticateJWT, requireRole(['loan_officer', 'compliance_officer', 'cfo_executive', 'admin']), async (req, res) => {
  try {
    const loan = await db.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    const customer = loan.customer || {
      first_name: 'Applicant',
      last_name: 'Corp',
      annual_revenue: 5000000,
      kyc_status: 'verified'
    };

    // Execute Gemini AI Risk Engine
    const riskAssessment = await GeminiService.evaluateLoanRisk(loan, customer);

    // Save updated score & JSON assessment
    const updatedLoan = await db.updateLoanRiskAssessment(loan.id, riskAssessment.riskScore, riskAssessment);

    // Log AI session for auditing
    await db.logAiSession(
      req.user.id,
      'loan_risk',
      `Commercial Loan Risk Assessment for Loan #${loan.id.slice(0, 8)} ($${loan.principal_amount})`,
      riskAssessment
    );

    return res.json({
      success: true,
      message: 'AI Risk assessment completed',
      riskAssessment,
      loan: updatedLoan
    });
  } catch (err) {
    console.error('Loan Risk Assessment Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to complete risk assessment' });
  }
});

// PATCH /api/loans/:id/approve (Loan Officer Approval)
router.patch('/:id/approve', authenticateJWT, requireRole(['loan_officer', 'finance_manager', 'cfo_executive', 'admin']), async (req, res) => {
  try {
    const loan = await db.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    if (loan.status === 'disbursed') {
      return res.status(400).json({ success: false, error: 'Loan has already been disbursed' });
    }

    const updatedLoan = await db.updateLoanStatus(req.params.id, 'approved', req.user.id);
    return res.json({
      success: true,
      message: 'Loan application approved by Underwriting',
      loan: updatedLoan
    });
  } catch (err) {
    console.error('Loan Approval Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to approve loan' });
  }
});

// PUT /api/loans/:id (Modify loan record)
router.put('/:id', authenticateJWT, requireRole(['loan_officer', 'finance_manager', 'cfo_executive', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLoan = await db.updateLoanDetails(id, req.body);
    if (!updatedLoan) return res.status(404).json({ success: false, error: 'Loan application record not found' });

    return res.json({
      success: true,
      message: 'Loan application record modified successfully',
      loan: updatedLoan
    });
  } catch (err) {
    console.error('Error modifying loan record:', err);
    return res.status(500).json({ success: false, error: 'Failed to modify loan record' });
  }
});

// DELETE /api/loans/:id (Delete loan record)
router.delete('/:id', authenticateJWT, requireRole(['cfo_executive', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteLoanRecord(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Loan record not found' });

    return res.json({
      success: true,
      message: `Loan record #${id.slice(0, 8)} deleted successfully`
    });
  } catch (err) {
    console.error('Error deleting loan record:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete loan record' });
  }
});

export default router;
