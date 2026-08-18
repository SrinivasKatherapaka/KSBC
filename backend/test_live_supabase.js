import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLiveSync() {
  console.log('--- 1. Testing Live Customer Upsert to Supabase ---');
  const custId = uuidv4();
  const customerPayload = {
    id: custId,
    first_name: 'Srinivas',
    last_name: 'Katherapaka Tech Corp',
    email: `srinivas.${Date.now()}@ksbc-client.com`,
    phone: '+1-555-901-8822',
    national_id: `US-EIN-${Date.now().toString().slice(-7)}`,
    annual_revenue: 12000000.00,
    kyc_status: 'verified',
    kyc_notes: 'Live Portal Intake Verification'
  };

  const { data: custData, error: custErr } = await supabase
    .from('customers')
    .insert(customerPayload)
    .select()
    .single();

  console.log('Customer Insert Error:', custErr);
  console.log('Customer Insert Success:', custData?.id, custData?.first_name, custData?.last_name);

  console.log('\n--- 2. Testing Live Loan Insert to Supabase ---');
  // Get a valid user ID from Supabase
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const defaultUserId = users && users.length > 0 ? users[0].id : 'a1111111-1111-4111-a111-111111111111';

  const loanId = uuidv4();
  const aiRiskAssessment = {
    riskScore: 28,
    riskLevel: 'LOW',
    applicantName: 'Srinivas Katherapaka Tech Corp',
    applicantCategory: 'corporate',
    decisionNotes: 'Live Supabase real-time sync verified from Portal',
    dtiRatio: 0.22,
    collateralValue: 5000000,
    creditScore: 760,
    defaultProbability: 3.5,
    recommendation: 'APPROVE',
    actionLogs: [
      {
        action: 'underwriting',
        notes: 'Application registered from portal and synced live to Supabase',
        timestamp: new Date().toISOString(),
        user_id: defaultUserId
      }
    ],
    summaryAdvisory: 'Optimal commercial risk profile with solid deposit backing.'
  };

  const loanPayload = {
    id: loanId,
    customer_id: custId,
    principal_amount: 3500000.00,
    interest_rate: 6.25,
    term_months: 36,
    purpose: 'Commercial Real Estate Acquisition',
    status: 'underwriting', // maps to loan_status_enum
    risk_score: 28,
    ai_risk_assessment: aiRiskAssessment,
    created_by: defaultUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: loanData, error: loanErr } = await supabase
    .from('loans')
    .insert(loanPayload)
    .select('*, customer:customers(*)')
    .single();

  console.log('Loan Insert Error:', loanErr);
  console.log('Loan Inserted in Supabase successfully! Details:', {
    id: loanData?.id,
    principal_amount: loanData?.principal_amount,
    status: loanData?.status,
    created_at: loanData?.created_at,
    customer_name: `${loanData?.customer?.first_name} ${loanData?.customer?.last_name}`
  });

  console.log('\n--- 3. Verifying Live Query from Supabase (Latest 3 Loans) ---');
  const { data: latestLoans, error: fetchErr } = await supabase
    .from('loans')
    .select('id, principal_amount, status, created_at, customer:customers(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('Fetch error:', fetchErr);
  console.log('Latest loans in live Supabase:');
  console.table(latestLoans.map(l => ({
    id: l.id.slice(0, 8),
    principal: l.principal_amount,
    status: l.status,
    created_at: l.created_at,
    customer: `${l.customer?.first_name} ${l.customer?.last_name}`
  })));
}

testLiveSync();
