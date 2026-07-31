import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, supabase, isSupabaseConfigured } from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function exportLoansAndSyncSupabase() {
  console.log('🏦 Starting KSBC Commercial & Private Loans Master Excel Export & Supabase Synchronization...');

  // 1. Gather all backend loans and customers data
  const loans = await db.getLoans();
  const customers = await db.getCustomers();

  console.log(`📈 Loaded ${loans.length} Loan Applications from backend database:`);

  // Map customers for quick lookup
  const customerMap = new Map();
  customers.forEach(c => {
    customerMap.set(c.id, c);
    if (c.account_number) customerMap.set(c.account_number, c);
  });

  // Format Helper for Loan Record
  const formatLoanRow = (l) => {
    const cust = customerMap.get(l.customer_id) || {};
    const riskAssessment = l.ai_risk_assessment || {};

    return {
      'Loan Application ID': l.id,
      'Customer ID': l.customer_id,
      'Applicant Name': l.applicant_name || `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'N/A',
      'Applicant Category': (l.applicant_category || cust.client_category || 'private_savings').replace('_', ' ').toUpperCase(),
      'Account Number': cust.account_number || `KSBC-ACC-${(l.customer_id || '').slice(0, 8)}`,
      'Principal Amount ($)': Number(l.principal_amount || 0),
      'Interest Rate (% APR)': Number(l.interest_rate || 0),
      'Term (Months)': Number(l.term_months || 12),
      'Loan Purpose': l.purpose || 'Commercial Growth Capital',
      'Underwriting Status': (l.status || 'draft').toUpperCase(),
      'AI Risk Score (0-100)': Number(l.risk_score || riskAssessment.riskScore || 45),
      'AI Risk Rating': (riskAssessment.riskLevel || (l.risk_score <= 40 ? 'LOW' : l.risk_score <= 70 ? 'MODERATE' : 'HIGH')),
      'Recommended Action': riskAssessment.underwritingRecommendation || (l.risk_score <= 40 ? 'APPROVE' : 'CONDITIONAL_APPROVE'),
      'AI Summary Advisory': riskAssessment.summaryAdvisory || `Gemini Underwriting Score: ${l.risk_score || 45}/100`,
      'Created By Officer': l.created_by || 'Customer Ops Team',
      'Approved By Executive': l.approved_by || 'Pending Executive Review',
      'Disbursed By Treasury': l.disbursed_by || 'Pending Treasury Disbursement',
      'Created Date': l.created_at || new Date().toISOString()
    };
  };

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Master All Loans Portfolio (54 Loans)
  const allLoansFormatted = loans.map(formatLoanRow);
  const wsAllLoans = XLSX.utils.json_to_sheet(allLoansFormatted);
  XLSX.utils.book_append_sheet(workbook, wsAllLoans, 'All Loans Portfolio');

  // Sheet 2: Disbursed Active Loans
  const disbursedLoans = loans.filter(l => l.status === 'disbursed').map(formatLoanRow);
  const wsDisbursed = XLSX.utils.json_to_sheet(disbursedLoans);
  XLSX.utils.book_append_sheet(workbook, wsDisbursed, 'Disbursed Active Portfolio');

  // Sheet 3: Approved Pending Disbursement
  const approvedLoans = loans.filter(l => l.status === 'approved').map(formatLoanRow);
  const wsApproved = XLSX.utils.json_to_sheet(approvedLoans);
  XLSX.utils.book_append_sheet(workbook, wsApproved, 'Approved Pending Disbursement');

  // Sheet 4: Underwriting & Compliance Pipeline
  const pipelineLoans = loans.filter(l => l.status === 'underwriting' || l.status === 'compliance_review').map(formatLoanRow);
  const wsPipeline = XLSX.utils.json_to_sheet(pipelineLoans);
  XLSX.utils.book_append_sheet(workbook, wsPipeline, 'Underwriting Pipeline');

  // Sheet 5: Draft Applications
  const draftLoans = loans.filter(l => l.status === 'draft').map(formatLoanRow);
  const wsDraft = XLSX.utils.json_to_sheet(draftLoans);
  XLSX.utils.book_append_sheet(workbook, wsDraft, 'Draft Applications');

  // Sheet 6: Rejected Applications
  const rejectedLoans = loans.filter(l => l.status === 'rejected').map(formatLoanRow);
  const wsRejected = XLSX.utils.json_to_sheet(rejectedLoans);
  XLSX.utils.book_append_sheet(workbook, wsRejected, 'Rejected Applications');

  // Ensure output directories exist
  const backendDataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(backendDataDir)) {
    fs.mkdirSync(backendDataDir, { recursive: true });
  }

  const loansExcelBackendPath = path.join(backendDataDir, 'KSBC_Loans_Portfolio_Master.xlsx');
  const loansExcelRootPath = path.resolve(__dirname, '../../..', 'KSBC_Loans_Portfolio_Master.xlsx');

  const approvedExcelBackendPath = path.join(backendDataDir, 'KSBC_Approved_Loans_Master.xlsx');
  const approvedExcelRootPath = path.resolve(__dirname, '../../..', 'KSBC_Approved_Loans_Master.xlsx');

  XLSX.writeFile(workbook, loansExcelBackendPath);
  XLSX.writeFile(workbook, loansExcelRootPath);

  // Dedicated Approved Loans Workbook
  const approvedWorkbook = XLSX.utils.book_new();
  const allApprovedAndDisbursed = loans.filter(l => l.status === 'approved' || l.status === 'disbursed').map(formatLoanRow);
  const wsAllApproved = XLSX.utils.json_to_sheet(allApprovedAndDisbursed);
  XLSX.utils.book_append_sheet(approvedWorkbook, wsAllApproved, 'All Approved Loans');
  XLSX.utils.book_append_sheet(approvedWorkbook, wsDisbursed, 'Disbursed Loans');
  XLSX.utils.book_append_sheet(approvedWorkbook, wsApproved, 'Approved Pending Disbursed');

  XLSX.writeFile(approvedWorkbook, approvedExcelBackendPath);
  XLSX.writeFile(approvedWorkbook, approvedExcelRootPath);

  console.log(`✅ Excel master loans sheet created successfully with 6 worksheets:`);
  console.log(` 📁 Path 1: ${loansExcelBackendPath}`);
  console.log(` 📁 Path 2: ${loansExcelRootPath}`);
  console.log(` 📊 Worksheets Included:`);
  console.log(`    1. All Loans Portfolio (${loans.length} Loans)`);
  console.log(`    2. Disbursed Active Portfolio (${disbursedLoans.length} Loans)`);
  console.log(`    3. Approved Pending Disbursement (${approvedLoans.length} Loans)`);
  console.log(`    4. Underwriting Pipeline (${pipelineLoans.length} Loans)`);
  console.log(`    5. Draft Applications (${draftLoans.length} Loans)`);
  console.log(`    6. Rejected Applications (${rejectedLoans.length} Loans)`);

  // 2. Sync all loans into Supabase PostgreSQL
  if (!isSupabaseConfigured || !supabase) {
    console.log(`⚠️ Supabase credentials not set in .env. Mock loans exported to Excel and loaded in-memory.`);
    return;
  }

  console.log(`⚡ Syncing all ${loans.length} commercial & private loans to Supabase PostgreSQL...`);

  try {
    const loanChunkSize = 20;
    let syncedCount = 0;

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
        if (fallbackErr) {
          console.warn(`Supabase Loans batch ${j / loanChunkSize + 1} warning:`, fallbackErr.message);
        } else {
          syncedCount += chunk.length;
        }
      } else if (!loanErr) {
        syncedCount += chunk.length;
      }
    }

    console.log(`🎉 ${syncedCount} of ${loans.length} Commercial & Private Loans synced successfully to Supabase PostgreSQL!`);

  } catch (err) {
    console.error('❌ Error during Supabase loans synchronization:', err.message);
  }
}

exportLoansAndSyncSupabase();
