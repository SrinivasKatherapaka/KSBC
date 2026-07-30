-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM (
  'customer_ops', 'compliance_officer', 'loan_officer', 
  'treasury_manager', 'finance_manager', 'cfo_executive', 'admin'
);

CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'flagged', 'rejected');
CREATE TYPE loan_status_enum AS ENUM ('draft', 'compliance_review', 'underwriting', 'approved', 'disbursed', 'rejected');
CREATE TYPE po_status_enum AS ENUM ('draft', 'submitted', 'approved', 'paid', 'cancelled');

-- USERS TABLE
CREATE TABLE users (
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
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(100) UNIQUE NOT NULL,
  annual_revenue NUMERIC(15, 2) DEFAULT 0.00,
  kyc_status kyc_status_enum DEFAULT 'pending',
  kyc_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOANS TABLE
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
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

-- GENERAL LEDGER ACCOUNTS TABLE
CREATE TABLE gl_accounts (
  account_code VARCHAR(50) PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
  balance NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENERAL LEDGER TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code VARCHAR(50) NOT NULL REFERENCES gl_accounts(account_code),
  debit_amount NUMERIC(15, 2) DEFAULT 0.00,
  credit_amount NUMERIC(15, 2) DEFAULT 0.00,
  reference_id VARCHAR(255) NOT NULL, -- Loan ID or PO ID reference
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE vendors (
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
  status VARCHAR(50) DEFAULT 'pending_payment',
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

-- SEED DEFAULT GL ACCOUNTS
INSERT INTO gl_accounts (account_code, account_name, account_type, balance) VALUES
  ('1010', 'Vault & Bank Cash Reserves', 'Asset', 50000000.00),
  ('1200', 'Commercial Loans Portfolio', 'Asset', 0.00),
  ('2010', 'Customer Deposits', 'Liability', 50000000.00),
  ('4010', 'Loan Interest Revenue', 'Revenue', 0.00),
  ('5010', 'Procurement Operating Expenses', 'Expense', 0.00)
ON CONFLICT DO NOTHING;

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access Users" ON users FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Customers" ON customers FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Loans" ON loans FOR ALL USING (true);
CREATE POLICY "Service Role Full Access GL Accounts" ON gl_accounts FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Vendors" ON vendors FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Purchase Orders" ON purchase_orders FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Procurement" ON procurement FOR ALL USING (true);
CREATE POLICY "Service Role Full Access AI Sessions" ON ai_sessions FOR ALL USING (true);
