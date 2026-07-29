import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum([
    'customer_ops',
    'compliance_officer',
    'loan_officer',
    'treasury_manager',
    'finance_manager',
    'cfo_executive',
    'admin'
  ])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const createCustomerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  nationalId: z.string().min(3),
  annualRevenue: z.number().min(0).default(0)
});

export const createLoanSchema = z.object({
  customerId: z.string().uuid().optional(),
  applicantName: z.string().min(2).optional(),
  applicantCategory: z.enum(['private_individual', 'corporate', 'sme', 'institutional']).optional().default('corporate'),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0.1).max(30),
  termMonths: z.number().int().positive(),
  purpose: z.string().min(3)
});

export const createPoSchema = z.object({
  vendorId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(5)
});

export const createVendorSchema = z.object({
  vendorName: z.string().min(2),
  taxId: z.string().min(3),
  contactEmail: z.string().email()
});

export const aiAssistantSchema = z.object({
  message: z.string().min(1),
  context: z.record(z.any()).optional()
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Failed',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ success: false, error: 'Invalid request body' });
    }
  };
};
