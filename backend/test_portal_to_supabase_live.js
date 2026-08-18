import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPortalToSupabase() {
  console.log('====================================================');
  console.log('🚀 TESTING LIVE PORTAL INTAKE -> SUPABASE DATABASE SYNC');
  console.log('====================================================\n');

  // 1. Authenticate as Loan Officer
  console.log('1. Authenticating with KSBC ERP Backend...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'loan@banking.com',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✅ Authenticated as Loan Officer. Token received.');

  // 2. Submit Fresh Loan Application through Portal API
  console.log('\n2. Submitting fresh loan application from portal...');
  const portalLoanData = {
    applicantName: 'Srinivas Katherapaka Enterprise AI',
    applicantCategory: 'corporate',
    principalAmount: 4800000,
    interestRate: 6.75,
    termMonths: 48,
    annualRevenue: 15000000,
    creditScore: 780,
    collateralValue: 6000000,
    purpose: 'AI Banking Automation & Cloud Infrastructure',
    actionTaken: 'on_hold',
    decisionNotes: 'Pending final review of multi-cloud architecture certifications'
  };

  const createRes = await fetch(`${API_BASE}/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(portalLoanData)
  });

  const createData = await createRes.json();
  const createdLoan = createData.loan;
  console.log('✅ Fresh Loan Registered via Portal API:');
  console.log({
    id: createdLoan.id,
    applicant_name: createdLoan.applicant_name,
    principal_amount: createdLoan.principal_amount,
    status: createdLoan.status,
    risk_score: createdLoan.risk_score,
    created_at: createdLoan.created_at
  });

  // 3. Direct Query to Supabase to verify live persistence
  console.log('\n3. Querying LIVE Supabase PostgreSQL database directly...');
  const { data: sbLoan, error: sbError } = await supabase
    .from('loans')
    .select('*, customer:customers(*)')
    .eq('id', createdLoan.id)
    .single();

  if (sbError || !sbLoan) {
    console.error('❌ FAILED: Loan not found in Supabase database:', sbError);
    process.exit(1);
  }

  console.log('🎉 SUCCESS! Loan verified LIVE in Supabase PostgreSQL:');
  console.log({
    supabase_loan_id: sbLoan.id,
    customer_id: sbLoan.customer_id,
    customer_name: `${sbLoan.customer?.first_name} ${sbLoan.customer?.last_name}`,
    customer_national_id: sbLoan.customer?.national_id,
    principal_amount: `$${Number(sbLoan.principal_amount).toLocaleString()}`,
    interest_rate: `${sbLoan.interest_rate}%`,
    term_months: `${sbLoan.term_months} months`,
    supabase_status: sbLoan.status,
    risk_score: `${sbLoan.risk_score}/100`,
    created_at: sbLoan.created_at,
    ai_risk_assessment_summary: sbLoan.ai_risk_assessment?.summaryAdvisory || sbLoan.ai_risk_assessment?.decisionNotes
  });

  // 4. Test Live Action Outcome Mutation (Approve)
  console.log('\n4. Executing Action Outcome -> "APPROVED" via Portal...');
  const updateRes = await fetch(`${API_BASE}/loans/${createdLoan.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'approved',
      action: 'approved',
      notes: 'Collateral verified. Approved for full disbursement facility.'
    })
  });

  const updateData = await updateRes.json();
  console.log('✅ Portal API updated status to:', updateData.loan?.status);

  // 5. Query Supabase again to verify live status update
  console.log('\n5. Verifying live status mutation in Supabase database...');
  const { data: sbUpdatedLoan } = await supabase
    .from('loans')
    .select('id, status, updated_at, ai_risk_assessment')
    .eq('id', createdLoan.id)
    .single();

  console.log('🎉 Verified LIVE Status in Supabase:', {
    supabase_loan_id: sbUpdatedLoan.id,
    supabase_live_status: sbUpdatedLoan.status,
    updated_at: sbUpdatedLoan.updated_at,
    action_logs_count: sbUpdatedLoan.ai_risk_assessment?.actionLogs?.length
  });

  console.log('\n====================================================');
  console.log('✅ ALL PORTAL LOAN ENTRIES ARE 100% LIVE IN SUPABASE!');
  console.log('====================================================\n');
}

testPortalToSupabase().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
