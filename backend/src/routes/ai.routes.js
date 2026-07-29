import { Router } from 'express';
import { db } from '../config/db.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest, aiAssistantSchema } from '../middleware/validate.js';
import { GeminiService } from '../services/gemini.service.js';

const router = Router();

// POST /api/ai/assistant (Chat with Gemini ERP Assistant)
router.post('/assistant', authenticateJWT, validateRequest(aiAssistantSchema), async (req, res) => {
  try {
    const { message } = req.body;

    const glAccounts = await db.getGlAccounts();
    const vaultCash = glAccounts.find(a => a.account_code === '1010')?.balance || 50000000;
    const loanPortfolio = glAccounts.find(a => a.account_code === '1200')?.balance || 0;
    const customers = await db.getCustomers();
    const loans = await db.getLoans();

    const systemContext = {
      cashReserves: vaultCash,
      loanPortfolio,
      totalCustomers: customers.length,
      activeLoans: loans.length
    };

    const aiResponse = await GeminiService.processAssistantChat(message, systemContext);

    // Save session in advisory logs
    const sessionLog = await db.logAiSession(
      req.user.id,
      'general_assistant',
      message,
      aiResponse
    );

    return res.json({
      success: true,
      aiResponse,
      sessionId: sessionLog.id
    });
  } catch (err) {
    console.error('AI Assistant Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process AI query' });
  }
});

// GET /api/ai/history
router.get('/history', authenticateJWT, async (req, res) => {
  try {
    const sessions = await db.getAiSessions(req.user.id);
    return res.json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch AI history' });
  }
});

// DELETE /api/ai/history/:id
router.delete('/history/:id', authenticateJWT, async (req, res) => {
  try {
    await db.deleteAiSession(req.params.id, req.user.id);
    return res.json({ success: true, message: 'AI session deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

export default router;
