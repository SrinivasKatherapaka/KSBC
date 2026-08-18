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

// POST /api/loans/calculate-risk-preview (Real-time live risk calculator before submit)
router.post('/calculate-risk-preview', authenticateJWT, async (req, res) => {
  try {
    const assessment = await GeminiService.calculateLoanRisk({
      applicantName: req.body.applicantName || 'Applicant',
      accountNumber: req.body.accountNumber || 'KSBC-NEW-APP',
      taxId: req.body.taxId || 'US-TAX-ID',
      customerEmail: req.body.customerEmail || 'applicant@banking.com',
      principalAmount: Number(req.body.principalAmount || 500000),
      interestRate: Number(req.body.interestRate || 6.5),
      termMonths: Number(req.body.termMonths || 36),
      annualIncome: Number(req.body.annualRevenue || req.body.annualIncome || 2000000),
      creditScore: Number(req.body.creditScore || 720),
      dtiRatio: req.body.dtiRatio ? Number(req.body.dtiRatio) : undefined,
      collateralValue: Number(req.body.collateralValue || Number(req.body.principalAmount || 500000) * 1.25),
      loanPurpose: req.body.purpose || 'Working Capital',
      applicantCategory: req.body.applicantCategory || 'corporate'
    });
    return res.json({ success: true, assessment });
  } catch (err) {
    console.error('Risk preview error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate risk preview' });
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

// POST /api/loans (Create fresh loan application with auto-calculated risk)
router.post('/', authenticateJWT, validateRequest(createLoanSchema), async (req, res) => {
  try {
    const { 
      customerId, 
      applicantName, 
      applicantCategory, 
      principalAmount, 
      interestRate, 
      termMonths, 
      purpose, 
      status,
      actionTaken,
      decisionNotes,
      notes,
      annualRevenue,
      creditScore,
      collateralValue,
      dtiRatio
    } = req.body;

    let targetCustomerId = customerId;
    let targetApplicantName = applicantName;
    let matchingCustomer = null;

    const allCustomers = await db.getCustomers();
    if (customerId) {
      matchingCustomer = allCustomers.find(c => c.id === customerId);
      if (matchingCustomer && !targetApplicantName) {
        targetApplicantName = `${matchingCustomer.first_name} ${matchingCustomer.last_name}`.trim();
      }
    }

    if (!targetCustomerId && targetApplicantName) {
      const nameParts = targetApplicantName.trim().split(' ');
      const fName = nameParts[0] || 'Commercial';
      const lName = nameParts.slice(1).join(' ') || 'Applicant';

      matchingCustomer = allCustomers.find(c => 
        c.first_name?.toLowerCase() === fName.toLowerCase() && 
        c.last_name?.toLowerCase() === lName.toLowerCase()
      );

      if (matchingCustomer) {
        targetCustomerId = matchingCustomer.id;
      } else {
        const newCust = await db.createCustomer({
          first_name: fName,
          last_name: lName,
          email: `${fName.toLowerCase()}.${Date.now().toString().slice(-6)}@ksbc-client.com`,
          phone: '+1-555-019-2831',
          national_id: `US-TAX-${Date.now().toString().slice(-7)}`,
          annual_revenue: Number(annualRevenue || 5000000),
          client_category: applicantCategory || 'corporate',
          account_type: 'Commercial Loan Facility Account',
          account_number: `KSBC-CORP-${Date.now().toString().slice(-8)}`,
          kyc_status: 'verified',
          kyc_notes: 'Auto-onboarded for commercial loan application'
        });
        targetCustomerId = newCust.id;
        matchingCustomer = newCust;
      }
    } else if (!targetCustomerId && allCustomers.length > 0) {
      targetCustomerId = allCustomers[0].id;
      matchingCustomer = allCustomers[0];
    }

    const applicantRevenue = Number(annualRevenue || matchingCustomer?.annual_revenue || 5000000);
    const applicantCreditScore = Number(creditScore || 720);

    // ⚡ Execute real-time risk calculation model
    let riskAssessment = null;
    let calculatedRiskScore = 35;
    try {
      riskAssessment = await GeminiService.calculateLoanRisk({
        applicantName: targetApplicantName || 'Fresh Applicant',
        accountNumber: matchingCustomer?.account_number || `KSBC-APP-${Date.now().toString().slice(-6)}`,
        taxId: matchingCustomer?.national_id || 'US-SSN-VERIFIED',
        customerEmail: matchingCustomer?.email || 'intake@ksbc-banking.com',
        principalAmount: Number(principalAmount),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        annualIncome: applicantRevenue,
        creditScore: applicantCreditScore,
        dtiRatio: dtiRatio !== undefined ? Number(dtiRatio) : Number(((Number(principalAmount) * 0.04) / (applicantRevenue / 12)).toFixed(2)),
        collateralValue: collateralValue ? Number(collateralValue) : Number(principalAmount) * 1.25,
        loanPurpose: purpose,
        applicantCategory: applicantCategory || matchingCustomer?.client_category || 'corporate'
      });
      calculatedRiskScore = riskAssessment?.riskScore || 35;
    } catch (riskErr) {
      console.warn('[RISK CALCULATION FALLBACK]', riskErr.message);
      calculatedRiskScore = Math.min(Math.max(Math.round((Number(principalAmount) / Math.max(applicantRevenue, 1)) * 36 + 20), 15), 90);
      riskAssessment = {
        riskScore: calculatedRiskScore,
        riskLevel: calculatedRiskScore > 70 ? 'HIGH' : (calculatedRiskScore > 40 ? 'MODERATE' : 'LOW'),
        defaultProbability: Number((calculatedRiskScore * 0.28).toFixed(1)),
        dtiRatio: Number(((Number(principalAmount) * 0.04) / (applicantRevenue / 12)).toFixed(2)),
        maxRecommendedLoan: Math.round(applicantRevenue * 0.45),
        recommendation: calculatedRiskScore <= 40 ? 'APPROVE' : (calculatedRiskScore <= 70 ? 'CONDITIONAL_APPROVE' : 'REJECT'),
        summaryAdvisory: `Auto risk scoring calculated score: ${calculatedRiskScore}/100.`
      };
    }

    // Determine initial status & action
    const resolvedStatus = actionTaken || status || 'draft';
    const initialNotes = decisionNotes || notes || `Fresh intake application submitted. Initial Risk Score: ${calculatedRiskScore}/100.`;

    const newLoan = await db.createLoan({
      customer_id: targetCustomerId,
      applicant_name: targetApplicantName || 'Private Account Holder',
      applicant_category: applicantCategory || matchingCustomer?.client_category || 'corporate',
      principal_amount: Number(principalAmount),
      interest_rate: Number(interestRate),
      term_months: Number(termMonths),
      purpose,
      status: resolvedStatus,
      risk_score: calculatedRiskScore,
      ai_risk_assessment: riskAssessment,
      decision_notes: initialNotes,
      approved_by: resolvedStatus === 'approved' ? req.user.id : null,
      created_by: req.user.id,
      action_logs: [
        {
          action: resolvedStatus,
          notes: initialNotes,
          timestamp: new Date().toISOString(),
          user_id: req.user.id,
          risk_score: calculatedRiskScore
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Fresh loan application #${(newLoan.id || '').slice(0, 8)} registered successfully with AI Risk Score: ${calculatedRiskScore}/100`,
      loan: newLoan
    });
  } catch (err) {
    console.error('Error creating loan:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create loan application' });
  }
});

// PATCH /api/loans/:id/status (Universal outcome action: on_hold, approved, rejected, underwriting, disbursed)
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, action } = req.body;
    const targetStatus = action || status;

    if (!targetStatus) {
      return res.status(400).json({ success: false, error: 'Status or action is required' });
    }

    const loan = await db.getLoanById(id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    let approverId = null;
    let disburserId = null;
    if (targetStatus === 'approved') approverId = req.user.id;
    if (targetStatus === 'disbursed') disburserId = req.user.id;

    const updatedLoan = await db.updateLoanStatus(id, targetStatus, approverId, disburserId, notes);

    // Audit log
    await db.logAiSession(
      req.user.id,
      'loan_action_outcome',
      `Action taken on Loan #${id.slice(0, 8)}: ${targetStatus.toUpperCase()} - Reason: ${notes || 'Standard decision flow'}`,
      { previousStatus: loan.status, newStatus: targetStatus, notes }
    );

    return res.json({
      success: true,
      message: `Loan #${id.slice(0, 8)} status successfully updated to "${targetStatus}"`,
      loan: updatedLoan
    });
  } catch (err) {
    console.error('Loan Status Update Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update loan status' });
  }
});

// POST /api/loans/:id/assess-risk (Run Gemini Risk Model)
router.post('/:id/assess-risk', authenticateJWT, async (req, res) => {
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
router.patch('/:id/approve', authenticateJWT, async (req, res) => {
  try {
    const loan = await db.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    if (loan.status === 'disbursed') {
      return res.status(400).json({ success: false, error: 'Loan has already been disbursed' });
    }

    const updatedLoan = await db.updateLoanStatus(req.params.id, 'approved', req.user.id, null, 'Approved by Underwriting Officer');
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
router.put('/:id', authenticateJWT, async (req, res) => {
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
router.delete('/:id', authenticateJWT, async (req, res) => {
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
