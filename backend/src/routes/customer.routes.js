import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateRequest, createCustomerSchema } from '../middleware/validate.js';

const router = Router();

// GET /api/customers
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const customers = await db.getCustomers();
    return res.json({ success: true, customers });
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/wal/status (WAL Persistence Engine Status)
router.get('/wal/status', authenticateJWT, async (req, res) => {
  try {
    const wal = await db.getWalStatus();
    return res.json({ success: true, wal });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch WAL status' });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const customers = await db.getCustomers();
    const customer = customers.find(c => c.id === req.params.id || c.account_number === req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer account not found' });
    }
    return res.json({ success: true, customer });
  } catch (err) {
    console.error('Error fetching customer details:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch customer account details' });
  }
});

// POST /api/customers (Create New Account - Restricted to CFO, Compliance & Admin)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const isAuthorized = (
      req.user.role === 'cfo' ||
      req.user.role === 'cfo_executive' ||
      req.user.role === 'compliance' ||
      req.user.role === 'compliance_officer' ||
      req.user.role === 'admin' ||
      req.user.email === 'cfo@banking.com' ||
      req.user.email === 'compliance@banking.com' ||
      req.user.email === 'admin@banking.com'
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Creating new customer accounts is restricted to CFO, Compliance Officer, and System Administrator credentials only.'
      });
    }

    const { firstName, lastName, email, phone, nationalId, annualRevenue, clientCategory, accountType, kycStatus, kycNotes } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, error: 'First Name, Last Name, and Email are required' });
    }

    const newCustomer = await db.createCustomer({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || '+1-555-0199',
      national_id: nationalId || `US-SSN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`,
      annual_revenue: Number(annualRevenue || 0),
      client_category: clientCategory || 'private_savings',
      account_type: accountType || (clientCategory === 'hnwi' ? 'Private High-Net-Worth Reserve' : clientCategory === 'corporate' ? 'Corporate Treasury Checking' : 'Private Standard Savings'),
      kyc_status: kycStatus || 'verified',
      kyc_notes: kycNotes || 'Cleared under executive intake protocol.'
    });

    return res.status(201).json({
      success: true,
      message: 'New customer account created successfully and synced to database & Supabase.',
      customer: newCustomer
    });
  } catch (err) {
    console.error('Error creating customer account:', err);
    return res.status(500).json({ success: false, error: 'Failed to create customer account' });
  }
});

// PUT /api/customers/:id (Modify Account - Restricted to CFO & Admin)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const isAuthorized = req.user.role === 'cfo' || req.user.role === 'admin' || req.user.email === 'cfo@banking.com' || req.user.email === 'admin@banking.com';
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Account modification privileges are restricted to CFO and System Administrator credentials only.'
      });
    }

    const { firstName, lastName, email, phone, annualRevenue, clientCategory, accountType, kycStatus } = req.body;
    const updatePayload = {};

    if (firstName) updatePayload.first_name = firstName;
    if (lastName) updatePayload.last_name = lastName;
    if (email) updatePayload.email = email;
    if (phone) updatePayload.phone = phone;
    if (annualRevenue !== undefined) updatePayload.annual_revenue = Number(annualRevenue);
    if (clientCategory) updatePayload.client_category = clientCategory;
    if (accountType) updatePayload.account_type = accountType;
    if (kycStatus) updatePayload.kyc_status = kycStatus;

    const updated = await db.updateCustomer(req.params.id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Customer account not found' });
    }

    return res.json({ success: true, message: 'Account updated successfully', customer: updated });
  } catch (err) {
    console.error('Error modifying customer account:', err);
    return res.status(500).json({ success: false, error: 'Failed to modify account' });
  }
});

// DELETE /api/customers/:id (Delete Account - Restricted to CFO & Admin)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const isAuthorized = req.user.role === 'cfo' || req.user.role === 'admin' || req.user.email === 'cfo@banking.com' || req.user.email === 'admin@banking.com';
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Account deletion privileges are restricted to CFO and System Administrator credentials only.'
      });
    }

    const success = await db.deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Customer account not found' });
    }

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer account:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

// POST /api/customers/bulk-delete (Bulk Delete Accounts - Restricted to CFO & Admin)
router.post('/bulk-delete', authenticateJWT, async (req, res) => {
  try {
    const isAuthorized = req.user.role === 'cfo' || req.user.role === 'admin' || req.user.email === 'cfo@banking.com' || req.user.email === 'admin@banking.com';
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Account deletion privileges are restricted to CFO and System Administrator credentials only.'
      });
    }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of customer IDs required' });
    }

    for (const id of ids) {
      await db.deleteCustomer(id);
    }

    return res.json({ success: true, message: `${ids.length} customer accounts deleted successfully` });
  } catch (err) {
    console.error('Error bulk deleting customer accounts:', err);
    return res.status(500).json({ success: false, error: 'Failed to bulk delete customer accounts' });
  }
});

export default router;
