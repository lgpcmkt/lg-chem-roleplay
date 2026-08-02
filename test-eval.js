import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = "This is a test prompt.";
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0.2 }
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Error:', e);
  }
}

testGemini();
