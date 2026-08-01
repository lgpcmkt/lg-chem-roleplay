import express from 'express';
import { PRODUCTS, DOCTOR_TYPES } from './productData';
import { generateDoctorResponse, evaluateRoleplayTranscript } from './geminiService';
import { dbService } from './db';

const router = express.Router();

// GET /api/products
router.get('/products', (_req, res) => {
  res.json(Object.values(PRODUCTS));
});

// GET /api/doctor-types
router.get('/doctor-types', (_req, res) => {
  res.json(Object.values(DOCTOR_TYPES));
});

// POST /api/doctor-ai
router.post('/doctor-ai', async (req, res) => {
  try {
    const { productId, specialtyId, doctorTypeId, chatHistory = [], userMessage, userName } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    const result = await generateDoctorResponse(
      productId || 'zemidapa',
      specialtyId || 'endocrine',
      doctorTypeId || 'friendly',
      chatHistory,
      userMessage,
      userName
    );
    res.json(result);
  } catch (error: any) {
    console.error('API /api/doctor-ai error:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
});

// POST /api/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { productId, scenarioTitle, chatHistory = [], elevenLabsData } = req.body;
    
    if (!chatHistory || chatHistory.length === 0) {
      return res.status(400).json({ error: 'chatHistory is required' });
    }
    
    const result = await evaluateRoleplayTranscript(
      productId || 'zemidapa',
      scenarioTitle || '알 수 없는 시나리오',
      chatHistory,
      elevenLabsData
    );
    res.json(result);
  } catch (error: any) {
    console.error('API /api/evaluate error:', error);
    res.status(500).json({ error: 'Failed to evaluate', details: error.message });
  }
});

// POST /api/login
router.post('/login', (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'id and name are required' });
    }
    const user = dbService.loginUser(id, name);
    res.json(user);
  } catch (error: any) {
    console.error('API /api/login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

// GET /api/progress/:userId
router.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = dbService.getUserProgress(userId);
    res.json(progress);
  } catch (error: any) {
    console.error('API /api/progress error:', error);
    res.status(500).json({ error: 'Failed to get progress', details: error.message });
  }
});

// POST /api/session
router.post('/session', (req, res) => {
  try {
    const { id, userId, track, scenarioId, grade } = req.body;
    if (!id || !userId || !track || !scenarioId || !grade) {
      return res.status(400).json({ error: 'Missing required session fields' });
    }
    dbService.saveSession({ id, userId, track, scenarioId, grade });
    res.json({ success: true });
  } catch (error: any) {
    console.error('API /api/session error:', error);
    res.status(500).json({ error: 'Failed to save session', details: error.message });
  }
});

export default router;
