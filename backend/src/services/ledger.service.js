import { db } from '../config/db.js';

export class LedgerService {
  /**
   * Processes double-entry GL transactions for commercial loan disbursement
   */
  static async disburseLoanLedgerPosting(loan, disburserUserId) {
    const amount = Number(loan.principal_amount);
    const referenceId = `LOAN-DISBURSE-${loan.id.slice(0, 8).toUpperCase()}`;
    const description = `Capital Disbursement for Commercial Loan #${loan.id.slice(0, 8)} (${loan.purpose})`;

    // Double-Entry Accounting Rule:
    // Debit: 1200 - Commercial Loans Portfolio (+ Asset)
    // Credit: 1010 - Vault & Bank Cash Reserves (- Asset)
    const transactions = await db.postGlTransaction(
      '1200', // Debit account
      '1010', // Credit account
      amount,
      referenceId,
      description,
      disburserUserId
    );

    return transactions;
  }

  /**
   * Processes procurement purchase order payment GL entry
   */
  static async disbursePurchaseOrderLedgerPosting(po, payerUserId) {
    const amount = Number(po.amount);
    const referenceId = `PO-PAYMENT-${po.id.slice(0, 8).toUpperCase()}`;
    const description = `Procurement PO Settlement: ${po.description}`;

    // Debit: 5010 - Procurement Operating Expenses (+ Expense)
    // Credit: 1010 - Vault & Bank Cash Reserves (- Asset)
    const transactions = await db.postGlTransaction(
      '5010',
      '1010',
      amount,
      referenceId,
      description,
      payerUserId
    );

    return transactions;
  }
}
