/**
 * KSBC Enterprise Role-Based Access Control (RBAC) Permissions Matrix
 * Defines exact allowed roles per portal route.
 */

export const PORTAL_PERMISSIONS = {
  // 1. Dashboard - Available to all authenticated personnel
  '/dashboard': ['cfo_executive', 'admin', 'loan_officer', 'treasury_manager', 'compliance_officer', 'finance_manager', 'customer_ops'],
  
  // 2. Fresh Loan Applications - Loan Officer, Admin, CFO
  '/fresh-loans': ['loan_officer', 'cfo_executive', 'admin'],
  '/loan-applications': ['loan_officer', 'cfo_executive', 'admin'],
  
  // 3. CFO AI Chatbot - CFO Executive, Admin
  '/cfo-ai-chat': ['cfo_executive', 'admin'],
  
  // 4. Accounts Database - Customer Ops, Compliance Officer, Admin, CFO
  '/accounts': ['customer_ops', 'compliance_officer', 'admin', 'cfo_executive'],
  '/accounts/:id': ['customer_ops', 'compliance_officer', 'admin', 'cfo_executive'],
  
  // 5. Loans Database - Loan Officer, Treasury Manager, Admin, CFO
  '/loans-database': ['loan_officer', 'treasury_manager', 'admin', 'cfo_executive'],
  
  // 6. Loans Portfolio Pipeline - Loan Officer, Treasury Manager, Admin, CFO
  '/loans': ['loan_officer', 'treasury_manager', 'admin', 'cfo_executive'],
  
  // 7. AI Risk Calculator - Loan Officer, Admin, CFO
  '/loan-calculator': ['loan_officer', 'admin', 'cfo_executive'],
  
  // 8. Loan Defaulters & NPA - Loan Officer, Compliance Officer, Admin, CFO
  '/defaulters': ['loan_officer', 'compliance_officer', 'admin', 'cfo_executive'],
  
  // 9. AI Fraud Detection - Compliance Officer, Admin, CFO
  '/fraud-detection': ['compliance_officer', 'admin', 'cfo_executive'],
  
  // 10. AI Customer Support - Customer Ops, Admin, CFO
  '/customer-service': ['customer_ops', 'admin', 'cfo_executive'],
  
  // 11. Customer Operations - Customer Ops, Admin, CFO
  '/customers': ['customer_ops', 'admin', 'cfo_executive'],
  
  // 12. Compliance & KYC Hub - Compliance Officer, Admin, CFO
  '/compliance': ['compliance_officer', 'admin', 'cfo_executive'],
  
  // 13. Treasury Reserves - Treasury Manager, Finance Manager, Admin, CFO
  '/treasury': ['treasury_manager', 'finance_manager', 'admin', 'cfo_executive'],
  
  // 14. General Ledger - Finance Manager, Treasury Manager, Admin, CFO
  '/finance': ['finance_manager', 'treasury_manager', 'admin', 'cfo_executive'],
  
  // 15. Procurement & POs - Finance Manager, Admin, CFO
  '/procurement': ['finance_manager', 'admin', 'cfo_executive'],
  
  // 16. AI Workflow Automation - Admin, CFO
  '/workflow-automation': ['admin', 'cfo_executive'],
  
  // 17. AI Predictive Analytics - CFO Executive, Finance Manager, Admin
  '/predictive-analytics': ['cfo_executive', 'finance_manager', 'admin'],
  
  // 18. AI Intelligent Reporting - CFO Executive, Finance Manager, Admin
  '/intelligent-reporting': ['cfo_executive', 'finance_manager', 'admin'],
  
  // 19. AI ERP Assistant - All roles
  '/ai-assistant': ['cfo_executive', 'admin', 'loan_officer', 'treasury_manager', 'compliance_officer', 'finance_manager', 'customer_ops'],
  
  // 20. AI Advisory History - CFO Executive, Admin
  '/advisory-history': ['cfo_executive', 'admin'],
  
  // 21. User Security Profile - All roles
  '/profile': ['cfo_executive', 'admin', 'loan_officer', 'treasury_manager', 'compliance_officer', 'finance_manager', 'customer_ops']
};

/**
 * Check if a given user role has access to a specific portal path.
 */
export function hasPortalAccess(userRole, path) {
  const effectiveRole = userRole || 'cfo_executive';
  // Admin & CFO Executive carry global clearance
  if (effectiveRole === 'admin' || effectiveRole === 'cfo_executive') return true;
  
  // Match path or base path
  const basePath = '/' + (path.split('/')[1] || '');
  const allowedRoles = PORTAL_PERMISSIONS[path] || PORTAL_PERMISSIONS[basePath];
  
  if (!allowedRoles) return true; // Default fallback to open if not specified
  return allowedRoles.includes(effectiveRole);
}

