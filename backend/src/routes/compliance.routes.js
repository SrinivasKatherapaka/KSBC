import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { GeminiService } from '../services/gemini.service.js';

const router = Router();

// POST /api/compliance/verify-doc
router.post('/verify-doc', authenticateJWT, requireRole(['compliance_officer', 'customer_ops', 'admin']), async (req, res) => {
  try {
    const { customerId, documentName, documentBase64 } = req.body;

    if (!documentName) {
      return res.status(400).json({ success: false, error: 'Document name is required' });
    }

    // Call Gemini Multi-Modal OCR
    const ocrResult = await GeminiService.processDocumentOcr(documentName, documentBase64);

    let updatedCustomer = null;
    if (customerId) {
      const status = ocrResult.verificationStatus === 'VERIFIED' ? 'verified' : (ocrResult.verificationStatus === 'REJECTED' ? 'rejected' : 'flagged');
      updatedCustomer = await db.updateCustomerKyc(customerId, status, ocrResult.ocrNotes);
    }

    // Log AI session for compliance audit history
    await db.logAiSession(
      req.user.id,
      'compliance_ocr',
      `Document Verification for ${documentName} (Customer: ${customerId || 'N/A'})`,
      ocrResult
    );

    return res.json({
      success: true,
      ocrResult,
      customer: updatedCustomer
    });
  } catch (err) {
    console.error('Compliance OCR Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify compliance document' });
  }
});

export default router;
