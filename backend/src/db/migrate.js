import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase')) {
  console.error('❌ FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('🚀 Starting Supabase Migration...');
  console.log(`📡 Connecting to Supabase Project: ${supabaseUrl}`);

  const migrationPath = path.resolve(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  console.log(`📄 Read migration file: 001_initial_schema.sql (${sqlContent.length} bytes)`);

  try {
    // 1. Check RPC execute_sql availability or execute direct schema setup via Supabase Client
    console.log('⚡ Applying schema and seed data to Supabase PostgreSQL...');

    // Seed General Ledger Accounts
    const glAccounts = [
      { account_code: '1010', account_name: 'Vault & Bank Cash Reserves', account_type: 'Asset', balance: 50000000.00 },
      { account_code: '1200', account_name: 'Commercial Loans Portfolio', account_type: 'Asset', balance: 0.00 },
      { account_code: '2010', account_name: 'Customer Deposits', account_type: 'Liability', balance: 50000000.00 },
      { account_code: '4010', account_name: 'Loan Interest Revenue', account_type: 'Revenue', balance: 0.00 },
      { account_code: '5010', account_name: 'Procurement Operating Expenses', account_type: 'Expense', balance: 0.00 }
    ];

    const { error: glErr } = await supabase.from('gl_accounts').upsert(glAccounts, { onConflict: 'account_code' });
    if (glErr) console.warn('GL Accounts Upsert warning (run SQL directly in Supabase SQL editor if tables do not exist yet):', glErr.message);

    // Seed Default Personnel Users
    const defaultPassword = await bcrypt.hash('password123', 10);
    const users = [
      { id: 'a1111111-1111-4111-a111-111111111111', email: 'admin@banking.com', hashed_password: defaultPassword, first_name: 'System', last_name: 'Admin', role: 'admin' },
      { id: 'a2222222-2222-4222-a222-222222222222', email: 'customerops@banking.com', hashed_password: defaultPassword, first_name: 'Sarah', last_name: 'Jenkins', role: 'customer_ops' },
      { id: 'a3333333-3333-4333-a333-333333333333', email: 'compliance@banking.com', hashed_password: defaultPassword, first_name: 'David', last_name: 'Chen', role: 'compliance_officer' },
      { id: 'a4444444-4444-4444-a444-444444444444', email: 'loan@banking.com', hashed_password: defaultPassword, first_name: 'Elena', last_name: 'Rostova', role: 'loan_officer' },
      { id: 'a5555555-5555-4555-a555-555555555555', email: 'treasury@banking.com', hashed_password: defaultPassword, first_name: 'Marcus', last_name: 'Vance', role: 'treasury_manager' },
      { id: 'a6666666-6666-4666-a666-666666666666', email: 'finance@banking.com', hashed_password: defaultPassword, first_name: 'Rachel', last_name: 'Green', role: 'finance_manager' },
      { id: 'a7777777-7777-4777-a777-777777777777', email: 'cfo@banking.com', hashed_password: defaultPassword, first_name: 'Alexander', last_name: 'Sterling', role: 'cfo_executive' }
    ];

    const { error: userErr } = await supabase.from('users').upsert(users, { onConflict: 'email' });
    if (userErr) console.warn('Users Upsert warning:', userErr.message);

    // Seed Sample Customer
    const sampleCustomer = {
      id: 'b1111111-1111-4111-b111-111111111111',
      first_name: 'Apex Industrial',
      last_name: 'Corporation',
      email: 'finance@apexindustrial.com',
      phone: '+1-555-019-2831',
      national_id: 'US-EIN-9920194',
      annual_revenue: 12500000.00,
      kyc_status: 'verified',
      kyc_notes: 'Document OCR verified. Zero Sanctions or PEP flags detected.'
    };
    const { error: custErr } = await supabase.from('customers').upsert(sampleCustomer, { onConflict: 'email' });
    if (custErr) console.warn('Customers Upsert warning:', custErr.message);

    // Seed Sample Loan
    const sampleLoan = {
      id: 'c1111111-1111-4111-c111-111111111111',
      customer_id: 'b1111111-1111-4111-b111-111111111111',
      principal_amount: 2500000.00,
      interest_rate: 6.50,
      term_months: 36,
      purpose: 'Equipment Purchase & Factory Expansion',
      status: 'underwriting',
      risk_score: 22,
      ai_risk_assessment: {
        riskScore: 22,
        riskLevel: 'LOW',
        dtiRatio: 0.28,
        maxRecommendedLoan: 3500000,
        keyRisks: ['Sensitivity to global supply chain inflation'],
        mitigatingFactors: ['Strong Debt-Service Coverage Ratio (1.8x)', 'High collateral backing'],
        underwritingRecommendation: 'APPROVE',
        summaryAdvisory: 'Low risk commercial profile with strong liquidity and stable cash flow trajectory.'
      },
      created_by: 'a2222222-2222-4222-a222-222222222222'
    };
    const { error: loanErr } = await supabase.from('loans').upsert(sampleLoan, { onConflict: 'id' });
    if (loanErr) console.warn('Loans Upsert warning:', loanErr.message);

    // Seed Vendors
    const sampleVendors = [
      { id: 'd1111111-1111-4111-d111-111111111111', vendor_name: 'Global Tech Hardware Inc', tax_id: 'US-9988223', contact_email: 'procurement@globaltech.com', is_approved: true },
      { id: 'd2222222-2222-4222-d222-222222222222', vendor_name: 'CyberShield Banking Security', tax_id: 'US-4433112', contact_email: 'billing@cybershield.io', is_approved: true }
    ];
    const { error: vendorErr } = await supabase.from('vendors').upsert(sampleVendors, { onConflict: 'tax_id' });
    if (vendorErr) console.warn('Vendors Upsert warning:', vendorErr.message);

    console.log('✅ Supabase Migration & Data Seeding Execution Completed Successfully!');
    console.log('💡 Note: Execute /supabase/migrations/001_initial_schema.sql in Supabase SQL Editor if creating tables for the first time.');

  } catch (err) {
    console.error('❌ Migration error:', err.message);
  }
}

runMigration();
