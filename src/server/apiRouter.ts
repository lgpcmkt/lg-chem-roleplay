import express from 'express';
import { evaluateWithElevenLabs } from './evaluationService';
import { dbService } from './db';

const router = express.Router();

// POST /api/elevenlabs/evaluation/:conversationId
router.post('/elevenlabs/evaluation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await evaluateWithElevenLabs(conversationId);
    if (!result) {
      return res.status(404).json({ error: 'Evaluation not ready or failed' });
    }
    res.json(result);
  } catch (error: any) {
    console.error('API /api/elevenlabs/evaluation error:', error);
    res.status(500).json({ error: 'Failed to fetch ElevenLabs evaluation', details: error.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'id and name are required' });
    }
    const user = await dbService.loginUser(id, name);
    res.json(user);
  } catch (error: any) {
    console.error('API /api/login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

// GET /api/progress/:userId
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await dbService.getUserProgress(userId);
    res.json(progress);
  } catch (error: any) {
    console.error('API /api/progress error:', error);
    res.status(500).json({ error: 'Failed to get progress', details: error.message });
  }
});

// POST /api/session
router.post('/session', async (req, res) => {
  try {
    const { id, userId, track, scenarioId, grade } = req.body;
    if (!id || !userId || !track || !scenarioId || !grade) {
      return res.status(400).json({ error: 'Missing required session fields' });
    }
    await dbService.saveSession({ id, userId, track, scenarioId, grade });
    res.json({ success: true });
  } catch (error: any) {
    console.error('API /api/session error:', error);
    res.status(500).json({ error: 'Failed to save session', details: error.message });
  }
});

export default router;
