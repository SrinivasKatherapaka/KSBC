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

// POST /api/customers
router.post('/', authenticateJWT, requireRole(['customer_ops', 'admin']), validateRequest(createCustomerSchema), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, nationalId, annualRevenue } = req.body;

    const newCustomer = await db.createCustomer({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      national_id: nationalId,
      annual_revenue: annualRevenue
    });

    return res.status(201).json({
      success: true,
      message: 'Customer onboarded successfully',
      customer: newCustomer
    });
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
});

export default router;
