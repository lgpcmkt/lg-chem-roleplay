import express from 'express';
import { PRODUCTS, DOCTOR_TYPES } from './productData';
import { generateDoctorResponse, evaluateRoleplayTranscript } from './geminiService';

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
    const { productId, scenarioTitle, chatHistory = [] } = req.body;
    if (!chatHistory || chatHistory.length === 0) {
      return res.status(400).json({ error: 'chatHistory is required' });
    }
    const result = await evaluateRoleplayTranscript(
      productId || 'zemidapa',
      scenarioTitle || '알 수 없는 시나리오',
      chatHistory
    );
    res.json(result);
  } catch (error: any) {
    console.error('API /api/evaluate error:', error);
    res.status(500).json({ error: 'Failed to evaluate', details: error.message });
  }
});

export default router;
