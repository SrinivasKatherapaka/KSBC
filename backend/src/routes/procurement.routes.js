import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateRequest, createPoSchema, createVendorSchema } from '../middleware/validate.js';
import { LedgerService } from '../services/ledger.service.js';

const router = Router();

// GET /api/procurement/vendors
router.get('/vendors', authenticateJWT, async (req, res) => {
  try {
    const vendors = await db.getVendors();
    return res.json({ success: true, vendors });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch vendors' });
  }
});

// POST /api/procurement/vendors
router.post('/vendors', authenticateJWT, requireRole(['finance_manager', 'admin']), validateRequest(createVendorSchema), async (req, res) => {
  try {
    const { vendorName, taxId, contactEmail } = req.body;
    const vendor = await db.createVendor({
      vendor_name: vendorName,
      tax_id: taxId,
      contact_email: contactEmail
    });
    return res.status(201).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create vendor' });
  }
});

// GET /api/procurement/pos
router.get('/pos', authenticateJWT, async (req, res) => {
  try {
    const pos = await db.getPurchaseOrders();
    return res.json({ success: true, purchaseOrders: pos });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch purchase orders' });
  }
});

// POST /api/procurement/pos
router.post('/pos', authenticateJWT, requireRole(['finance_manager', 'admin']), validateRequest(createPoSchema), async (req, res) => {
  try {
    const { vendorId, amount, description } = req.body;

    const newPo = await db.createPurchaseOrder({
      vendor_id: vendorId,
      amount,
      description,
      created_by: req.user.id
    });

    // Auto write GL expense entry
    await LedgerService.disbursePurchaseOrderLedgerPosting(newPo, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Purchase order created & GL ledger debited',
      purchaseOrder: newPo
    });
  } catch (err) {
    console.error('Error creating purchase order:', err);
    return res.status(500).json({ success: false, error: 'Failed to create purchase order' });
  }
});

// PUT /api/procurement/pos/:id/pay (Process Payment Due)
router.put('/pos/:id/pay', authenticateJWT, requireRole(['finance_manager', 'cfo_executive', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPo = await db.payPurchaseOrder(id, req.user.id);
    if (!updatedPo) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    // Auto write GL payment entry: Debit Expense (5010), Credit Vault Cash (1010)
    await LedgerService.disbursePurchaseOrderLedgerPosting(updatedPo, req.user.id);

    return res.json({
      success: true,
      message: 'Payment processed successfully and posted to General Ledger.',
      purchaseOrder: updatedPo
    });
  } catch (err) {
    console.error('Error processing PO payment:', err);
    return res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
});

export default router;
