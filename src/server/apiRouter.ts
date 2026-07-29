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
    const { productId, scenarioTitle, chatHistory = [], conversationId } = req.body;
    
    if (conversationId) {
      const apiKey = process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
      if (apiKey) {
        // Poll ElevenLabs API for analysis
        let analysisResult = null;
        for (let i = 0; i < 15; i++) {
          try {
            const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
              headers: { 'xi-api-key': apiKey }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.analysis && data.analysis.evaluation_criteria_results) {
                analysisResult = data.analysis;
                break;
              }
            }
          } catch (e) {
            console.error('ElevenLabs poll error:', e);
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (analysisResult?.evaluation_criteria_results) {
          const rpCriteria = analysisResult.evaluation_criteria_results.rp || Object.values(analysisResult.evaluation_criteria_results)[0];
          if (rpCriteria) {
             const isSuccess = rpCriteria.result === 'success';
             const reasoning = rpCriteria.rationale || '평가 결과가 성공적으로 수집되었습니다.';
             return res.json({ isSuccess, reasoning, strengths: [], weaknesses: [] });
          }
        }
      }
    }

    // Fallback to Gemini if no conversationId or ElevenLabs failed
    if (!chatHistory || chatHistory.length === 0) {
      return res.status(400).json({ error: 'chatHistory is required when ElevenLabs evaluation fails' });
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
