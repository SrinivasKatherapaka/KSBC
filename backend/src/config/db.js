import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-supabase') && 
  !supabaseKey.includes('your-supabase')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// In-Memory Database fallback store with persistent seeded structure
const memoryDb = {
  users: [],
  customers: [],
  loans: [],
  gl_accounts: [
    { account_code: '1010', account_name: 'Vault & Bank Cash Reserves', account_type: 'Asset', balance: 50000000.00, created_at: new Date().toISOString() },
    { account_code: '1200', account_name: 'Commercial Loans Portfolio', account_type: 'Asset', balance: 0.00, created_at: new Date().toISOString() },
    { account_code: '2010', account_name: 'Customer Deposits', account_type: 'Liability', balance: 50000000.00, created_at: new Date().toISOString() },
    { account_code: '4010', account_name: 'Loan Interest Revenue', account_type: 'Revenue', balance: 0.00, created_at: new Date().toISOString() },
    { account_code: '5010', account_name: 'Procurement Operating Expenses', account_type: 'Expense', balance: 0.00, created_at: new Date().toISOString() }
  ],
  transactions: [],
  vendors: [
    { id: 'v1000001-1111-4111-v111-111111111111', vendor_name: 'Global Tech Hardware Inc', tax_id: 'US-9988223', contact_email: 'procurement@globaltech.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000002-2222-4222-v222-222222222222', vendor_name: 'CyberShield Banking Security', tax_id: 'US-4433112', contact_email: 'billing@cybershield.io', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000003-3333-4333-v333-333333333333', vendor_name: 'OmniCloud Data Infrastructure', tax_id: 'US-8822991', contact_email: 'enterprise@omnicloud.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000004-4444-4444-v444-444444444444', vendor_name: 'Apex Data Center Solutions', tax_id: 'US-7711005', contact_email: 'orders@apexdatacenters.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000005-5555-4555-v555-555555555555', vendor_name: 'Vanguard ATM & Vault Hardware', tax_id: 'US-3344556', contact_email: 'finance@vanguardatm.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000006-6666-4666-v666-666666666666', vendor_name: 'BioPharma Commercial Equipment', tax_id: 'US-6655443', contact_email: 'accounts@biopharmasupplies.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000007-7777-4777-v777-777777777777', vendor_name: 'Titan Real Estate Management', tax_id: 'US-2233441', contact_email: 'billing@titanproperties.com', is_approved: true, created_at: new Date().toISOString() },
    { id: 'v1000008-8888-4888-v888-888888888888', vendor_name: 'Solstice Renewable Energy Corp', tax_id: 'US-1122334', contact_email: 'orders@solsticepower.com', is_approved: true, created_at: new Date().toISOString() }
  ],
  purchase_orders: [],
  ai_sessions: []
};

// Seed Data Name Generators
const FIRST_NAMES = [
  'Katherapaka', 'Alexander', 'Sarah', 'David', 'Elena', 'Marcus', 'Rachel', 'Vikram', 'Priya', 'Ananya',
  'Rohan', 'Michael', 'Jessica', 'Emily', 'Christopher', 'Amanda', 'Daniel', 'Sophia', 'James', 'Olivia',
  'Ethan', 'Isabella', 'William', 'Ava', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Henry', 'Amelia',
  'Alexander', 'Harper', 'Sebastian', 'Evelyn', 'Jack', 'Abigail', 'Owen', 'Emily', 'Theodore', 'Ella'
];

const LAST_NAMES = [
  'Srinivas', 'Sterling', 'Jenkins', 'Chen', 'Rostova', 'Vance', 'Green', 'Sharma', 'Patel', 'Reddy',
  'Mehta', 'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
  'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis'
];

const COMPANY_PREFIXES = [
  'Apex', 'Horizon', 'Vertex', 'Zenith', 'Quantum', 'Crescent', 'Titan', 'Aero', 'Starlight', 'Nexus',
  'Vanguard', 'Pinnacle', 'Synergy', 'Echo', 'Omni', 'Solstice', 'Orion', 'Velox', 'Astral', 'Summit'
];

const COMPANY_SECTORS = [
  'Industrial', 'Logistics', 'BioPharma', 'Solar & Energy', 'Technologies', 'Retail Corp', 'Capital', 'Robotics', 'AeroSystems', 'HealthCare'
];

const LOAN_PURPOSES = [
  'Equipment Purchase & Automation',
  'Working Capital Expansion',
  'Commercial Real Estate Acquisition',
  'Debt Refinancing & Consolidation',
  'R&D Facility Upgrade',
  'Personal Wealth Portfolio Scaling',
  'Estate Development & High Net-Worth Credit'
];

function initializeSeedData() {
  if (memoryDb.users.length === 0) {
    const defaultUsers = [
      { id: 'a1111111-1111-4111-a111-111111111111', email: 'admin@banking.com', first_name: 'System', last_name: 'Admin', role: 'admin', is_active: true, created_at: new Date().toISOString() },
      { id: 'a2222222-2222-4222-a222-222222222222', email: 'customerops@banking.com', first_name: 'Sarah', last_name: 'Jenkins', role: 'customer_ops', is_active: true, created_at: new Date().toISOString() },
      { id: 'a3333333-3333-4333-a333-333333333333', email: 'compliance@banking.com', first_name: 'David', last_name: 'Chen', role: 'compliance_officer', is_active: true, created_at: new Date().toISOString() },
      { id: 'a4444444-4444-4444-a444-444444444444', email: 'loan@banking.com', first_name: 'Elena', last_name: 'Rostova', role: 'loan_officer', is_active: true, created_at: new Date().toISOString() },
      { id: 'a5555555-5555-4555-a555-555555555555', email: 'treasury@banking.com', first_name: 'Marcus', last_name: 'Vance', role: 'treasury_manager', is_active: true, created_at: new Date().toISOString() },
      { id: 'a6666666-6666-4666-a666-666666666666', email: 'finance@banking.com', first_name: 'Rachel', last_name: 'Green', role: 'finance_manager', is_active: true, created_at: new Date().toISOString() },
      { id: 'a7777777-7777-4777-a777-777777777777', email: 'cfo@banking.com', first_name: 'Alexander', last_name: 'Sterling', role: 'cfo_executive', is_active: true, created_at: new Date().toISOString() }
    ];
    memoryDb.users.push(...defaultUsers);
  }

  // Seed 220 Accounts: Exactly 150 Private Savings + 50 High Net-Worth Individuals (HNWI) + 20 Corporate Clients
  if (memoryDb.customers.length === 0) {
    const kycStatuses = ['verified', 'verified', 'verified', 'pending', 'flagged'];

    // 1. Seed 150 Private Savings Account Holders
    for (let i = 1; i <= 150; i++) {
      const fn = FIRST_NAMES[i % FIRST_NAMES.length];
      const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
      const depositBalance = (i * 75000 + 45000) % 5500000 + 35000;
      const kycStatus = kycStatuses[i % kycStatuses.length];

      memoryDb.customers.push({
        id: `b${String(i).padStart(7, '0')}-1111-4111-b111-111111111111`,
        first_name: fn,
        last_name: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@privatesavings.com`,
        phone: `+1-555-${String(100 + (i % 800)).padStart(3, '0')}-${String(1000 + i * 7).slice(-4)}`,
        national_id: `US-SSN-***-**-${3000 + i}`,
        annual_revenue: depositBalance,
        client_category: 'private_savings',
        account_type: 'Private Standard Savings',
        account_number: `KSBC-SAV-${10000000 + i * 1492}`,
        kyc_status: kycStatus,
        kyc_notes: kycStatus === 'verified' ? 'Automated SSN & Identity screening cleared.' : (kycStatus === 'pending' ? 'Identity verification pending.' : 'Requires compliance audit.'),
        created_at: new Date(Date.now() - (220 - i) * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 2. Seed 50 High Net-Worth Individuals (HNWI)
    for (let j = 1; j <= 50; j++) {
      const idx = 150 + j;
      const fn = FIRST_NAMES[(j * 2) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(j * 5) % LAST_NAMES.length];
      const hnwiBalance = (j * 850000 + 1200000) % 45000000 + 2500000;
      const kycStatus = kycStatuses[j % kycStatuses.length];

      memoryDb.customers.push({
        id: `b${String(idx).padStart(7, '0')}-1111-4111-b111-111111111111`,
        first_name: fn,
        last_name: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@hnwealth.com`,
        phone: `+1-555-${String(400 + (j % 500)).padStart(3, '0')}-${String(3000 + j * 9).slice(-4)}`,
        national_id: `US-SSN-***-**-${7000 + j}`,
        annual_revenue: hnwiBalance,
        client_category: 'hnwi',
        account_type: 'Private High-Net-Worth Reserve',
        account_number: `KSBC-HNW-${50000000 + j * 3819}`,
        kyc_status: kycStatus,
        kyc_notes: 'High-Net-Worth Private Wealth Clearance.',
        created_at: new Date(Date.now() - (70 - j) * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 3. Seed 20 Corporate Clients
    for (let k = 1; k <= 20; k++) {
      const idx = 200 + k;
      const prefix = COMPANY_PREFIXES[k % COMPANY_PREFIXES.length];
      const sector = COMPANY_SECTORS[k % COMPANY_SECTORS.length];
      const companyName = `${prefix} ${sector}`;
      const legalSuffix = k % 2 === 0 ? 'Corporation' : 'LLC';
      const corpBalance = (k * 2500000 + 3500000) % 85000000 + 5000000;
      const kycStatus = kycStatuses[k % kycStatuses.length];

      memoryDb.customers.push({
        id: `b${String(idx).padStart(7, '0')}-1111-4111-b111-111111111111`,
        first_name: companyName,
        last_name: legalSuffix,
        email: `treasury@${prefix.toLowerCase()}${sector.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: `+1-555-${String(700 + (k % 200)).padStart(3, '0')}-${String(8000 + k * 11).slice(-4)}`,
        national_id: `US-EIN-${8800000 + k * 412}`,
        annual_revenue: corpBalance,
        client_category: 'corporate',
        account_type: 'Corporate Treasury Checking',
        account_number: `KSBC-CORP-${90000000 + k * 4912}`,
        kyc_status: kycStatus,
        kyc_notes: 'Corporate Beneficial Ownership cleared.',
        created_at: new Date(Date.now() - (20 - k) * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  // Seed 54 Loans reflecting all 3 categories (Private Savings, HNWI, Corporate) across all 6 statuses
  if (memoryDb.loans.length === 0 && memoryDb.customers.length > 0) {
    const statuses = ['draft', 'compliance_review', 'underwriting', 'approved', 'disbursed', 'rejected'];

    for (let k = 0; k < 54; k++) {
      const status = statuses[k % statuses.length];
      const customer = memoryDb.customers[k % memoryDb.customers.length];
      const category = customer.client_category || 'private_savings';
      const applicantName = `${customer.first_name} ${customer.last_name}`;

      const principal = (k * 480000 + 250000) % 12000000 + 150000;
      const rate = Number((4.5 + (k % 8) * 0.75).toFixed(2));
      const terms = [12, 24, 36, 60, 120, 240][k % 6];
      const purpose = LOAN_PURPOSES[k % LOAN_PURPOSES.length];

      const riskScore = Math.min(Math.round((principal / Math.max(customer.annual_revenue, 1)) * 36 + 20), 94);
      let riskLevel = 'LOW';
      if (riskScore > 70) riskLevel = 'HIGH';
      else if (riskScore > 40) riskLevel = 'MODERATE';

      memoryDb.loans.push({
        id: `c${String(k + 1).padStart(7, '0')}-1111-4111-c111-111111111111`,
        customer_id: customer.id,
        applicant_name: applicantName,
        applicant_category: category,
        principal_amount: principal,
        interest_rate: rate,
        term_months: terms,
        purpose,
        status,
        risk_score: riskScore,
        ai_risk_assessment: {
          riskScore,
          riskLevel,
          dtiRatio: Number((principal / customer.annual_revenue * 0.38).toFixed(2)),
          maxRecommendedLoan: Math.round(customer.annual_revenue * 0.4),
          keyRisks: ['Interest rate volatility', 'Debt service capacity'],
          mitigatingFactors: ['Verified bank deposits', 'Established KSBC account history'],
          underwritingRecommendation: riskScore <= 40 ? 'APPROVE' : (riskScore <= 70 ? 'CONDITIONAL_APPROVE' : 'REJECT'),
          summaryAdvisory: `Gemini Risk Score: ${riskScore}/100 (${riskLevel}) for ${applicantName}.`
        },
        created_by: 'a2222222-2222-4222-a222-222222222222',
        approved_by: (status === 'approved' || status === 'disbursed') ? 'a4444444-4444-4444-a444-444444444444' : null,
        disbursed_by: status === 'disbursed' ? 'a5555555-5555-4555-a555-555555555555' : null,
        created_at: new Date(Date.now() - (54 - k) * 43200000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  // Seed 8 Approved Vendors
  if (memoryDb.vendors.length === 0) {
    const defaultVendors = [
      { id: 'v1000001-1111-4111-v111-111111111111', vendor_name: 'Global Tech Hardware Inc', tax_id: 'US-9988223', contact_email: 'procurement@globaltech.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000002-2222-4222-v222-222222222222', vendor_name: 'CyberShield Banking Security', tax_id: 'US-4433112', contact_email: 'billing@cybershield.io', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000003-3333-4333-v333-333333333333', vendor_name: 'OmniCloud Data Infrastructure', tax_id: 'US-8822991', contact_email: 'enterprise@omnicloud.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000004-4444-4444-v444-444444444444', vendor_name: 'Apex Data Center Solutions', tax_id: 'US-7711005', contact_email: 'orders@apexdatacenters.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000005-5555-4555-v555-555555555555', vendor_name: 'Vanguard ATM & Vault Hardware', tax_id: 'US-3344556', contact_email: 'finance@vanguardatm.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000006-6666-4666-v666-666666666666', vendor_name: 'BioPharma Commercial Equipment', tax_id: 'US-6655443', contact_email: 'accounts@biopharmasupplies.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000007-7777-4777-v777-777777777777', vendor_name: 'Titan Real Estate Management', tax_id: 'US-2233441', contact_email: 'billing@titanproperties.com', is_approved: true, created_at: new Date().toISOString() },
      { id: 'v1000008-8888-4888-v888-888888888888', vendor_name: 'Solstice Renewable Energy Corp', tax_id: 'US-1122334', contact_email: 'orders@solsticepower.com', is_approved: true, created_at: new Date().toISOString() }
    ];
    memoryDb.vendors.push(...defaultVendors);
  }

  // Seed 12 Live Commercial Purchase Orders reflecting live orders & payments due
  if (memoryDb.purchase_orders.length === 0 && memoryDb.vendors.length > 0) {
    const seededPOs = [
      { id: 'po-1001-1111-4111-p111-111111111111', po_number: 'PO-2026-1001', vendor_id: memoryDb.vendors[2].id, amount: 250000.00, description: 'Enterprise Cloud Data Core & Backup Storage SAN', status: 'pending_payment', due_date: '2026-08-15T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-01T10:00:00.000Z' },
      { id: 'po-1002-2222-4222-p222-222222222222', po_number: 'PO-2026-1002', vendor_id: memoryDb.vendors[1].id, amount: 185000.00, description: 'Zero-Trust Banking Firewall & HSM Security Modules', status: 'paid', due_date: '2026-07-28T00:00:00.000Z', paid_at: '2026-07-25T14:30:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-06-15T11:20:00.000Z' },
      { id: 'po-1003-3333-4333-p333-333333333333', po_number: 'PO-2026-1003', vendor_id: memoryDb.vendors[0].id, amount: 420000.00, description: 'Core Server Rack Array & High-Velocity Routers', status: 'pending_payment', due_date: '2026-08-20T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-05T09:15:00.000Z' },
      { id: 'po-1004-4444-4444-p444-444444444444', po_number: 'PO-2026-1004', vendor_id: memoryDb.vendors[3].id, amount: 310000.00, description: 'Secondary Data Center Hot-Disaster Recovery Site', status: 'approved', due_date: '2026-09-05T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-10T16:45:00.000Z' },
      { id: 'po-1005-5555-4555-p555-555555555555', po_number: 'PO-2026-1005', vendor_id: memoryDb.vendors[4].id, amount: 145000.00, description: 'Biometric Smart Vaults & Branch ATM Terminal Units', status: 'paid', due_date: '2026-06-30T00:00:00.000Z', paid_at: '2026-06-28T10:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-05-12T13:10:00.000Z' },
      { id: 'po-1006-6666-4666-p666-666666666666', po_number: 'PO-2026-1006', vendor_id: memoryDb.vendors[7].id, amount: 95000.00, description: 'Green Energy Micro-Grid Installation & Solar Feed', status: 'pending_payment', due_date: '2026-08-30T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-12T11:00:00.000Z' },
      { id: 'po-1007-7777-4777-p777-777777777777', po_number: 'PO-2026-1007', vendor_id: memoryDb.vendors[6].id, amount: 540000.00, description: 'Executive Regional Headquarters Facility Lease Q3', status: 'paid', due_date: '2026-07-15T00:00:00.000Z', paid_at: '2026-07-14T09:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-06-01T08:30:00.000Z' },
      { id: 'po-1008-8888-4888-p888-888888888888', po_number: 'PO-2026-1008', vendor_id: memoryDb.vendors[5].id, amount: 165000.00, description: 'Automated Vault Climate & Environmental Controls', status: 'in_review', due_date: '2026-09-12T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-18T14:20:00.000Z' },
      { id: 'po-1009-9999-4999-p999-999999999999', po_number: 'PO-2026-1009', vendor_id: memoryDb.vendors[2].id, amount: 380000.00, description: 'High-Frequency Banking API Gateway & Microservices Upgrade', status: 'pending_payment', due_date: '2026-08-10T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-02T15:00:00.000Z' },
      { id: 'po-1010-0000-4000-p000-000000000000', po_number: 'PO-2026-1010', vendor_id: memoryDb.vendors[1].id, amount: 290000.00, description: 'SOC-2 Penetration Testing & AI Fraud Sentinel Suite', status: 'paid', due_date: '2026-05-20T00:00:00.000Z', paid_at: '2026-05-18T16:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-04-10T10:00:00.000Z' },
      { id: 'po-1011-1112-4112-p112-111222333444', po_number: 'PO-2026-1011', vendor_id: memoryDb.vendors[3].id, amount: 175000.00, description: 'Fiber-Optic Low-Latency Backbone Interconnect Cabling', status: 'approved', due_date: '2026-10-01T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-20T12:00:00.000Z' },
      { id: 'po-1012-2223-4223-p223-222333444555', po_number: 'PO-2026-1012', vendor_id: memoryDb.vendors[0].id, amount: 510000.00, description: 'Tier-3 NVMe Storage SAN Array & High-Density Flash Drives', status: 'pending_payment', due_date: '2026-08-25T00:00:00.000Z', created_by: 'a6666666-6666-4666-a666-666666666666', created_at: '2026-07-22T09:30:00.000Z' }
    ];
    memoryDb.purchase_orders.push(...seededPOs);
  }
}

initializeSeedData();

export const db = {
  getStore: (tableName) => memoryDb[tableName] || [],
  
  findUserByEmail: async (email) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').ilike('email', cleanEmail).single();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  findUserById: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {}
    }
    return memoryDb.users.find(u => u.id === id) || null;
  },

  createUser: async (userData) => {
    const newUser = { id: uuidv4(), ...userData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').insert(newUser).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    memoryDb.users.push(newUser);
    return newUser;
  },

  getCustomers: async () => {
    // ALWAYS return all 220 seeded accounts from memoryDb so the full master accounts database is rendered cleanly
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length >= 200) return data;
      } catch (err) {}
    }
    return memoryDb.customers;
  },

  createCustomer: async (customerData) => {
    const newCustomer = { 
      id: uuidv4(), 
      client_category: customerData.clientCategory || 'private_savings',
      account_type: customerData.accountType || 'Private Standard Savings',
      account_number: `KSBC-ACC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      kyc_status: 'pending', 
      ...customerData, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('customers').insert(newCustomer).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    memoryDb.customers.push(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id, updateData) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('customers').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    const idx = memoryDb.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryDb.customers[idx] = { ...memoryDb.customers[idx], ...updateData, updated_at: new Date().toISOString() };
      return memoryDb.customers[idx];
    }
    return null;
  },

  deleteCustomer: async (id) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('loans').delete().eq('customer_id', id);
        await supabase.from('customers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete customer warning:', err.message);
      }
    }

    const initialCount = memoryDb.customers.length;
    memoryDb.customers = memoryDb.customers.filter(c => c.id !== id && c.account_number !== id && c.email !== id);
    memoryDb.loans = memoryDb.loans.filter(l => l.customer_id !== id);

    return true;
  },

  updateCustomerKyc: async (id, status, notes) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('customers').update({ kyc_status: status, kyc_notes: notes, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    const idx = memoryDb.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryDb.customers[idx].kyc_status = status;
      memoryDb.customers[idx].kyc_notes = notes;
      memoryDb.customers[idx].updated_at = new Date().toISOString();
      return memoryDb.customers[idx];
    }
    return null;
  },

  getLoans: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').select('*, customer:customers(*)').order('created_at', { ascending: false });
        if (!error && data && data.length >= 50) return data;
      } catch (err) {}
    }
    return memoryDb.loans.map(loan => ({
      ...loan,
      customer: memoryDb.customers.find(c => c.id === loan.customer_id) || null
    }));
  },

  getLoanById: async (id) => {
    const loan = memoryDb.loans.find(l => l.id === id);
    if (!loan) return null;
    return {
      ...loan,
      customer: memoryDb.customers.find(c => c.id === loan.customer_id) || null
    };
  },

  createLoan: async (loanData) => {
    const newLoan = {
      id: uuidv4(),
      status: 'draft',
      risk_score: null,
      ai_risk_assessment: null,
      approved_by: null,
      disbursed_by: null,
      ...loanData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').insert(newLoan).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    memoryDb.loans.push(newLoan);
    return newLoan;
  },

  updateLoanRiskAssessment: async (id, riskScore, assessmentData) => {
    const updatePayload = {
      risk_score: riskScore,
      ai_risk_assessment: assessmentData,
      status: 'underwriting',
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').update(updatePayload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    const idx = memoryDb.loans.findIndex(l => l.id === id);
    if (idx !== -1) {
      memoryDb.loans[idx] = { ...memoryDb.loans[idx], ...updatePayload };
      return memoryDb.loans[idx];
    }
    return null;
  },

  updateLoanStatus: async (id, status, approverId = null, disburserId = null) => {
    const updatePayload = { status, updated_at: new Date().toISOString() };
    if (approverId) updatePayload.approved_by = approverId;
    if (disburserId) updatePayload.disbursed_by = disburserId;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('loans').update(updatePayload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {}
    }
    const idx = memoryDb.loans.findIndex(l => l.id === id);
    if (idx !== -1) {
      memoryDb.loans[idx] = { ...memoryDb.loans[idx], ...updatePayload };
      return memoryDb.loans[idx];
    }
    return null;
  },

  getGlAccounts: async () => {
    return memoryDb.gl_accounts;
  },

  getTransactions: async () => {
    return memoryDb.transactions;
  },

  postGlTransaction: async (debitAccountCode, creditAccountCode, amount, referenceId, description, userId) => {
    const numAmount = Number(amount);
    const debitTx = {
      id: uuidv4(),
      account_code: debitAccountCode,
      debit_amount: numAmount,
      credit_amount: 0.00,
      reference_id: referenceId,
      description,
      created_by: userId,
      timestamp: new Date().toISOString()
    };
    const creditTx = {
      id: uuidv4(),
      account_code: creditAccountCode,
      debit_amount: 0.00,
      credit_amount: numAmount,
      reference_id: referenceId,
      description,
      created_by: userId,
      timestamp: new Date().toISOString()
    };

    memoryDb.transactions.unshift(debitTx, creditTx);
    const debitAcc = memoryDb.gl_accounts.find(a => a.account_code === debitAccountCode);
    const creditAcc = memoryDb.gl_accounts.find(a => a.account_code === creditAccountCode);
    if (debitAcc) debitAcc.balance = Number(debitAcc.balance) + numAmount;
    if (creditAcc) creditAcc.balance = Number(creditAcc.balance) - numAmount;

    return [debitTx, creditTx];
  },

  getVendors: async () => {
    return memoryDb.vendors;
  },

  createVendor: async (vendorData) => {
    const newVendor = { id: uuidv4(), is_approved: true, ...vendorData, created_at: new Date().toISOString() };
    memoryDb.vendors.push(newVendor);
    return newVendor;
  },

  getPurchaseOrders: async () => {
    return memoryDb.purchase_orders.map(po => ({
      ...po,
      vendor: memoryDb.vendors.find(v => v.id === po.vendor_id) || null
    }));
  },

  createPurchaseOrder: async (poData) => {
    const poNum = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPo = { 
      id: uuidv4(), 
      po_number: poNum, 
      status: 'pending_payment', 
      due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      ...poData, 
      created_at: new Date().toISOString() 
    };
    memoryDb.purchase_orders.unshift(newPo);
    return newPo;
  },

  payPurchaseOrder: async (poId, userId) => {
    const updatePayload = {
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('purchase_orders').update(updatePayload).eq('id', poId);
      } catch (err) {}
    }

    const idx = memoryDb.purchase_orders.findIndex(p => p.id === poId);
    if (idx !== -1) {
      memoryDb.purchase_orders[idx] = { ...memoryDb.purchase_orders[idx], ...updatePayload };
      return memoryDb.purchase_orders[idx];
    }
    return null;
  },

  logAiSession: async (userId, sessionType, promptContext, aiResponse) => {
    const sessionLog = {
      id: uuidv4(),
      user_id: userId,
      session_type: sessionType,
      prompt_context: promptContext,
      ai_response: aiResponse,
      created_at: new Date().toISOString()
    };
    memoryDb.ai_sessions.unshift(sessionLog);
    return sessionLog;
  },

  getAiSessions: async (userId) => {
    return memoryDb.ai_sessions.filter(s => s.user_id === userId);
  },

  deleteAiSession: async (id, userId) => {
    const idx = memoryDb.ai_sessions.findIndex(s => s.id === id && s.user_id === userId);
    if (idx !== -1) {
      memoryDb.ai_sessions.splice(idx, 1);
    }
    return true;
  }
};
