import { cfoExecutiveChat } from '../services/gemini.service.js';
import { db } from '../config/db.js';

async function test() {
  const loans = await db.getLoans();
  const customers = await db.getCustomers();
  const glAccounts = await db.getGlAccounts();

  const disbursedLoans = loans.filter(l => l.status === 'disbursed');
  const totalDisbursedAmount = disbursedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const totalApprovedAmount = approvedLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
  const totalLoansAmount = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0);
  const totalCustomerDeposits = customers.reduce((sum, c) => sum + Number(c.annual_revenue || 0), 0);

  const financialContext = {
    vaultCash: 50000000,
    loanPortfolio: totalDisbursedAmount || 42850000,
    customerDeposits: totalCustomerDeposits,
    totalLoansCount: loans.length,
    totalLoansAmount,
    totalDisbursedCount: disbursedLoans.length,
    totalDisbursedAmount,
    totalApprovedCount: approvedLoans.length,
    totalApprovedAmount,
    totalCustomersCount: customers.length
  };

  const response = await cfoExecutiveChat("delete the account of Katherapaka Srinivas", [], financialContext);
  console.log("=== CFO AI QUERY TEST OUTPUT ===");
  console.log(response.message);
  console.log("================================");
}

test();
