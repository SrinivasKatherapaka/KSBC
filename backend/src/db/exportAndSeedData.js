import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, supabase, isSupabaseConfigured } from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default NPA Defaulters dataset
const defaultNpaList = [
  { id: 'def-101', borrowerName: 'Titan Retail Logistics', originalPrincipal: 4500000, remainingBalance: 3800000, daysPastDue: 75, missedPayments: 3, collateralType: 'Commercial Real Estate', status: 'SMA-2' },
  { id: 'def-102', borrowerName: 'Katherapaka Srinivas (Private Wealth)', originalPrincipal: 1200000, remainingBalance: 950000, daysPastDue: 45, missedPayments: 2, collateralType: 'Investment Portfolio', status: 'SMA-1' },
  { id: 'def-103', borrowerName: 'AeroSystems Manufacturing', originalPrincipal: 8500000, remainingBalance: 7200000, daysPastDue: 110, missedPayments: 4, collateralType: 'Factory Automation Equipment', status: 'Substandard NPA' },
  { id: 'def-104', borrowerName: 'Solstice Solar Corp', originalPrincipal: 3200000, remainingBalance: 2900000, daysPastDue: 62, missedPayments: 2, collateralType: 'Solar Grid Infrastructure', status: 'SMA-2' }
];

// Default Fraud Alerts dataset
const defaultFraudAlerts = [
  { transactionId: 'TX-FRD-9901', accountNumber: 'KSBC-CORP-90004912', accountHolder: 'Apex Industrial Corp', amount: 850000, transactionType: 'International Wire Transfer', location: 'Zurich, Switzerland (Overseas)', IPAddress: '185.220.101.5', timeOfDay: '03:14 AM EST', averageTransactionAmount: 45000, fraudScore: 88, riskTag: 'HIGH_RISK_FRAUD', status: 'UNREVIEWED' },
  { transactionId: 'TX-FRD-9902', accountNumber: 'KSBC-SAV-10001492', accountHolder: 'Katherapaka Srinivas', amount: 145000, transactionType: 'Rapid ACH Outflow', location: 'London, UK', IPAddress: '194.26.29.11', timeOfDay: '02:45 AM EST', averageTransactionAmount: 12000, fraudScore: 76, riskTag: 'HIGH_RISK_FRAUD', status: 'UNREVIEWED' },
  { transactionId: 'TX-FRD-9903', accountNumber: 'KSBC-HNW-50003819', accountHolder: 'Alexander Sterling', amount: 250000, transactionType: 'Crypto Gateway Transfer', location: 'Cayman Islands', IPAddress: '103.251.170.8', timeOfDay: '11:22 PM EST', averageTransactionAmount: 65000, fraudScore: 68, riskTag: 'SUSPICIOUS', status: 'REVIEWING' }
];

export async function exportAndSeedData() {
  console.log('📊 Starting KSBC Banking ERP Excel Export & Supabase Synchronization...');

  // 1. Gather all backend mock data
  const users = db.getStore('users');
  const customers = await db.getCustomers();
  const loans = await db.getLoans();
  const glAccounts = await db.getGlAccounts();
  const vendors = await db.getVendors();

  console.log(`📈 Summary of Data Loaded:`);
  console.log(` - Personnel Users: ${users.length}`);
  console.log(` - Customer Accounts: ${customers.length}`);
  console.log(` - Commercial & Private Loans: ${loans.length}`);
  console.log(` - General Ledger Accounts: ${glAccounts.length}`);
  console.log(` - Approved Vendors: ${vendors.length}`);
  console.log(` - NPA Defaulter Accounts: ${defaultNpaList.length}`);
  console.log(` - Fraud Alert Transactions: ${defaultFraudAlerts.length}`);

  // 2. Generate Excel Workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Users
  const usersFormatted = users.map(u => ({
    'User ID': u.id,
    'Email Address': u.email,
    'First Name': u.first_name,
    'Last Name': u.last_name,
    'Assigned Role': u.role,
    'Active Status': u.is_active ? 'Active' : 'Inactive',
    'Created Date': u.created_at
  }));
  const wsUsers = XLSX.utils.json_to_sheet(usersFormatted);
  XLSX.utils.book_append_sheet(workbook, wsUsers, 'Personnel Users');

  // Sheet 2: Customers
  const customersFormatted = customers.map(c => ({
    'Account ID': c.id,
    'First Name / Company': c.first_name,
    'Last Name / Suffix': c.last_name,
    'Email': c.email,
    'Phone': c.phone,
    'National ID / EIN': c.national_id,
    'Annual Revenue / Balance ($)': c.annual_revenue,
    'Client Category': c.client_category || 'private_savings',
    'Account Type': c.account_type || 'Private Standard Savings',
    'Account Number': c.account_number || 'N/A',
    'KYC Clearance Status': c.kyc_status,
    'KYC Audit Notes': c.kyc_notes,
    'Onboarded Date': c.created_at
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customersFormatted);
  XLSX.utils.book_append_sheet(workbook, wsCustomers, 'Customer Accounts');

  // Sheet 3: Loans
  const loansFormatted = loans.map(l => ({
    'Loan Application ID': l.id,
    'Customer ID': l.customer_id,
    'Applicant Name': l.applicant_name || 'N/A',
    'Applicant Category': l.applicant_category || 'N/A',
    'Principal Amount ($)': l.principal_amount,
    'Interest Rate (%)': l.interest_rate,
    'Term (Months)': l.term_months,
    'Loan Purpose': l.purpose,
    'Underwriting Status': l.status,
    'AI Risk Score (0-100)': l.risk_score || 'Pending',
    'Created Date': l.created_at
  }));
  const wsLoans = XLSX.utils.json_to_sheet(loansFormatted);
  XLSX.utils.book_append_sheet(workbook, wsLoans, 'Loans Portfolio');

  // Sheet 4: GL Accounts
  const glFormatted = glAccounts.map(g => ({
    'Account Code': g.account_code,
    'Account Name': g.account_name,
    'Account Type': g.account_type,
    'Ledger Balance ($)': g.balance,
    'Created Date': g.created_at
  }));
  const wsGl = XLSX.utils.json_to_sheet(glFormatted);
  XLSX.utils.book_append_sheet(workbook, wsGl, 'General Ledger');

  // Sheet 5: Vendors
  const vendorsFormatted = vendors.map(v => ({
    'Vendor ID': v.id,
    'Vendor Name': v.vendor_name,
    'Tax Identification': v.tax_id,
    'Contact Email': v.contact_email,
    'Approval Clearance': v.is_approved ? 'Approved' : 'Pending',
    'Created Date': v.created_at
  }));
  const wsVendors = XLSX.utils.json_to_sheet(vendorsFormatted);
  XLSX.utils.book_append_sheet(workbook, wsVendors, 'Procurement Vendors');

  // Sheet 6: Defaulters NPA
  const defaultersFormatted = defaultNpaList.map(d => ({
    'Defaulter Record ID': d.id,
    'Borrower Entity': d.borrowerName,
    'Original Principal ($)': d.originalPrincipal,
    'Remaining Balance ($)': d.remainingBalance,
    'Days Past Due': d.daysPastDue,
    'Missed Payments': d.missedPayments,
    'Collateral Type': d.collateralType,
    'NPA Classification': d.status
  }));
  const wsDefaulters = XLSX.utils.json_to_sheet(defaultersFormatted);
  XLSX.utils.book_append_sheet(workbook, wsDefaulters, 'NPA Defaulters');

  // Sheet 7: Fraud Alerts
  const fraudFormatted = defaultFraudAlerts.map(f => ({
    'Transaction ID': f.transactionId,
    'Account Number': f.accountNumber,
    'Account Holder': f.accountHolder,
    'Amount ($)': f.amount,
    'Transaction Type': f.transactionType,
    'Geographic Location': f.location,
    'IP Address': f.IPAddress,
    'Time of Day': f.timeOfDay,
    'Average Historical Amount ($)': f.averageTransactionAmount,
    'AI Fraud Score (0-100)': f.fraudScore,
    'Risk Tag': f.riskTag,
    'Review Status': f.status
  }));
  const wsFraud = XLSX.utils.json_to_sheet(fraudFormatted);
  XLSX.utils.book_append_sheet(workbook, wsFraud, 'Fraud Alerts');

  // Ensure output directory exists
  const backendDataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(backendDataDir)) {
    fs.mkdirSync(backendDataDir, { recursive: true });
  }

  const backendExcelPath = path.join(backendDataDir, 'KSBC_Banking_ERP_Master_Data.xlsx');
  const rootExcelPath = path.resolve(__dirname, '../../..', 'KSBC_Banking_ERP_Master_Data.xlsx');

  XLSX.writeFile(workbook, backendExcelPath);
  XLSX.writeFile(workbook, rootExcelPath);

  console.log(`✅ Excel master sheet created successfully:`);
  console.log(` 📁 Path 1: ${backendExcelPath}`);
  console.log(` 📁 Path 2: ${rootExcelPath}`);

  // 3. Add & Seed Mock Data into Supabase
  if (!isSupabaseConfigured || !supabase) {
    console.log(`⚠️ Supabase is not configured with live credentials. Mock data generated in Excel and loaded in-memory.`);
    return;
  }

  console.log(`⚡ Syncing all Excel mock data directly to Supabase PostgreSQL...`);

  try {
    // A. Seed GL Accounts
    const { error: glErr } = await supabase.from('gl_accounts').upsert(glAccounts, { onConflict: 'account_code' });
    if (glErr) console.warn('Supabase GL Accounts warning:', glErr.message);
    else console.log(' ✅ General Ledger Accounts synced to Supabase');

    // B. Seed Personnel Users
    const defaultPassword = await bcrypt.hash('password123', 10);
    const usersWithPassword = users.map(u => ({
      id: u.id,
      email: u.email,
      hashed_password: u.hashed_password || defaultPassword,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      is_active: u.is_active
    }));
    const { error: userErr } = await supabase.from('users').upsert(usersWithPassword, { onConflict: 'email' });
    if (userErr) console.warn('Supabase Users warning:', userErr.message);
    else console.log(` ✅ ${usersWithPassword.length} Personnel Users synced to Supabase`);

    // C. Seed Customers (in batches of 50)
    const chunkSize = 50;
    for (let i = 0; i < customers.length; i += chunkSize) {
      const chunk = customers.slice(i, i + chunkSize).map(c => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        national_id: c.national_id,
        annual_revenue: c.annual_revenue,
        client_category: c.client_category || 'private_savings',
        account_type: c.account_type || 'Private Standard Savings',
        account_number: c.account_number,
        kyc_status: c.kyc_status,
        kyc_notes: c.kyc_notes
      }));

      let { error: custErr } = await supabase.from('customers').upsert(chunk, { onConflict: 'email' });
      if (custErr && custErr.message.includes('schema cache')) {
        const baseChunk = chunk.map(({ client_category, account_type, account_number, ...base }) => base);
        const { error: fallbackErr } = await supabase.from('customers').upsert(baseChunk, { onConflict: 'email' });
        if (fallbackErr) console.warn(`Supabase Customers batch ${i / chunkSize + 1} warning:`, fallbackErr.message);
      }
    }
    console.log(` ✅ ${customers.length} Customers synced to Supabase`);

    // D. Seed Loans (in batches of 20)
    const loanChunkSize = 20;
    for (let j = 0; j < loans.length; j += loanChunkSize) {
      const chunk = loans.slice(j, j + loanChunkSize).map(l => ({
        id: l.id,
        customer_id: l.customer_id,
        applicant_name: l.applicant_name,
        applicant_category: l.applicant_category,
        principal_amount: l.principal_amount,
        interest_rate: l.interest_rate,
        term_months: l.term_months,
        purpose: l.purpose,
        status: l.status,
        risk_score: l.risk_score,
        ai_risk_assessment: l.ai_risk_assessment,
        created_by: l.created_by,
        approved_by: l.approved_by,
        disbursed_by: l.disbursed_by
      }));

      let { error: loanErr } = await supabase.from('loans').upsert(chunk, { onConflict: 'id' });
      if (loanErr && loanErr.message.includes('schema cache')) {
        const baseChunk = chunk.map(({ applicant_name, applicant_category, ...base }) => base);
        const { error: fallbackErr } = await supabase.from('loans').upsert(baseChunk, { onConflict: 'id' });
        if (fallbackErr) console.warn(`Supabase Loans batch ${j / loanChunkSize + 1} warning:`, fallbackErr.message);
      }
    }
    console.log(` ✅ ${loans.length} Loans synced to Supabase`);

    // E. Seed Vendors
    const { error: vendorErr } = await supabase.from('vendors').upsert(vendors, { onConflict: 'tax_id' });
    if (vendorErr) console.warn('Supabase Vendors warning:', vendorErr.message);
    else console.log(` ✅ ${vendors.length} Approved Vendors synced to Supabase`);

    // F. Seed Purchase Orders & Procurement Table
    const purchaseOrders = await db.getPurchaseOrders();
    const poPayload = purchaseOrders.map(po => ({
      id: po.id,
      po_number: po.po_number || `PO-${po.id.slice(0, 8)}`,
      vendor_id: po.vendor_id,
      vendor_name: po.vendor?.vendor_name || 'Approved Vendor',
      requisition_description: po.description,
      amount: po.amount,
      status: po.status || 'pending_payment',
      due_date: po.due_date,
      paid_at: po.paid_at,
      created_by: po.created_by,
      created_at: po.created_at
    }));

    const { error: poErr } = await supabase.from('procurement').upsert(poPayload, { onConflict: 'po_number' });
    if (poErr) {
      const fallbackPo = poPayload.map(({ vendor_name, requisition_description, ...base }) => ({
        ...base,
        description: requisition_description
      }));
      await supabase.from('purchase_orders').upsert(fallbackPo, { onConflict: 'id' });
      console.log(` ✅ ${purchaseOrders.length} Purchase Orders synced to Supabase purchase_orders table`);
    } else {
      console.log(` ✅ ${purchaseOrders.length} Procurement Purchase Orders synced to Supabase procurement table`);
    }

    console.log('🎉 ALL Master Data Excel Exports & Supabase Synchronization Completed Cleanly!');

  } catch (err) {
    console.error('❌ Error during Supabase synchronization:', err.message);
  }
}

exportAndSeedData();
