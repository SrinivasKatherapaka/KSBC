-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'customer_ops', 'compliance_officer', 'loan_officer', 
    'treasury_manager', 'finance_manager', 'cfo_executive', 'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'flagged', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE loan_status_enum AS ENUM ('draft', 'compliance_review', 'underwriting', 'approved', 'disbursed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE po_status_enum AS ENUM ('draft', 'submitted', 'approved', 'paid', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer_ops',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(100) UNIQUE NOT NULL,
  annual_revenue NUMERIC(15, 2) DEFAULT 0.00,
  client_category VARCHAR(100) DEFAULT 'private_savings',
  account_type VARCHAR(100) DEFAULT 'Private Standard Savings',
  account_number VARCHAR(100),
  kyc_status kyc_status_enum DEFAULT 'pending',
  kyc_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS client_category VARCHAR(100) DEFAULT 'private_savings';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS account_type VARCHAR(100) DEFAULT 'Private Standard Savings';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS account_number VARCHAR(100);

-- LOANS TABLE
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  applicant_name VARCHAR(255),
  applicant_category VARCHAR(100) DEFAULT 'private_individual',
  principal_amount NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  term_months INT NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  status loan_status_enum DEFAULT 'draft',
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
  ai_risk_assessment JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users(id),
  disbursed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loans ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS applicant_category VARCHAR(100) DEFAULT 'private_individual';

-- GENERAL LEDGER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS gl_accounts (
  account_code VARCHAR(50) PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENERAL LEDGER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code VARCHAR(50) NOT NULL REFERENCES gl_accounts(account_code),
  debit_amount NUMERIC(15, 2) DEFAULT 0.00,
  credit_amount NUMERIC(15, 2) DEFAULT 0.00,
  reference_id VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROCUREMENT TABLE (Live Orders & Payments Due Reconciliations)
CREATE TABLE IF NOT EXISTS procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  vendor_name VARCHAR(255) NOT NULL,
  requisition_description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_payment', -- 'pending_payment', 'paid', 'approved', 'in_review'
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI SESSIONS & ADVISORY LOGS
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_type VARCHAR(50) NOT NULL,
  prompt_context TEXT NOT NULL,
  ai_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- SERVICE ROLE FULL ACCESS POLICIES
CREATE POLICY "Service Role Full Access Users" ON users FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Customers" ON customers FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Loans" ON loans FOR ALL USING (true);
CREATE POLICY "Service Role Full Access GL Accounts" ON gl_accounts FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Vendors" ON vendors FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Purchase Orders" ON purchase_orders FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Procurement" ON procurement FOR ALL USING (true);
CREATE POLICY "Service Role Full Access AI Sessions" ON ai_sessions FOR ALL USING (true);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- SERVICE ROLE ACCESS POLICIES
DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Users" ON users FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Customers" ON customers FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Loans" ON loans FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Transactions" ON transactions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Vendors" ON vendors FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access Purchase Orders" ON purchase_orders FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service Role Full Access AI Sessions" ON ai_sessions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- SEED DEFAULT GENERAL LEDGER ACCOUNTS
INSERT INTO gl_accounts (account_code, account_name, account_type, balance) VALUES
  ('1010', 'Vault & Bank Cash Reserves', 'Asset', 50000000.00),
  ('1200', 'Commercial Loans Portfolio', 'Asset', 0.00),
  ('2010', 'Customer Deposits', 'Liability', 50000000.00),
  ('4010', 'Loan Interest Revenue', 'Revenue', 0.00),
  ('5010', 'Procurement Operating Expenses', 'Expense', 0.00)
ON CONFLICT (account_code) DO NOTHING;

-- SEED DEFAULT USERS (Password: 'password123')
INSERT INTO users (id, email, hashed_password, first_name, last_name, role) VALUES
  ('a1111111-1111-4111-a111-111111111111', 'admin@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'System', 'Admin', 'admin'),
  ('a2222222-2222-4222-a222-222222222222', 'customerops@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'Sarah', 'Jenkins', 'customer_ops'),
  ('a3333333-3333-4333-a333-333333333333', 'compliance@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'David', 'Chen', 'compliance_officer'),
  ('a4444444-4444-4444-a444-444444444444', 'loan@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'Elena', 'Rostova', 'loan_officer'),
  ('a5555555-5555-4555-a555-555555555555', 'treasury@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'Marcus', 'Vance', 'treasury_manager'),
  ('a6666666-6666-4666-a666-666666666666', 'finance@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'Rachel', 'Green', 'finance_manager'),
  ('a7777777-7777-4777-a777-777777777777', 'cfo@banking.com', '$2a$10$wE99KqU7fS4VxgVjF1p6m.K1eZ3/fO0h7h0G.d6e5Zg91p7Gk4e.K', 'Alexander', 'Sterling', 'cfo_executive')
ON CONFLICT (email) DO NOTHING;

-- SEED SAMPLE CUSTOMER
INSERT INTO customers (id, first_name, last_name, email, phone, national_id, annual_revenue, kyc_status, kyc_notes) VALUES
  ('b1111111-1111-4111-b111-111111111111', 'Apex Industrial', 'Corporation', 'finance@apexindustrial.com', '+1-555-019-2831', 'US-EIN-9920194', 12500000.00, 'verified', 'Document OCR verified. Zero Sanctions or PEP flags detected.')
ON CONFLICT (email) DO NOTHING;

-- SEED SAMPLE COMMERCIAL LOAN
INSERT INTO loans (id, customer_id, principal_amount, interest_rate, term_months, purpose, status, risk_score, ai_risk_assessment, created_by) VALUES
  ('c1111111-1111-4111-c111-111111111111', 'b1111111-1111-4111-b111-111111111111', 2500000.00, 6.50, 36, 'Equipment Purchase & Factory Expansion', 'underwriting', 22, '{"riskScore": 22, "riskLevel": "LOW", "dtiRatio": 0.28, "maxRecommendedLoan": 3500000, "keyRisks": ["Sensitivity to global supply chain inflation"], "mitigatingFactors": ["Strong Debt-Service Coverage Ratio (1.8x)", "High collateral backing"], "underwritingRecommendation": "APPROVE", "summaryAdvisory": "Low risk commercial profile with strong liquidity and stable cash flow trajectory."}', 'a2222222-2222-4222-a222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- SEED VENDORS
INSERT INTO vendors (id, vendor_name, tax_id, contact_email, is_approved) VALUES
  ('d1111111-1111-4111-d111-111111111111', 'Global Tech Hardware Inc', 'US-9988223', 'procurement@globaltech.com', true),
  ('d2222222-2222-4222-d222-222222222222', 'CyberShield Banking Security', 'US-4433112', 'billing@cybershield.io', true)
ON CONFLICT (tax_id) DO NOTHING;
