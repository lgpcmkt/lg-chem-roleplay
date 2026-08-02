import fs from 'fs';

async function listModels() {
  const GEMINI_API_KEY = 'AIzaSyDJaehEdYwZwSNUgNlRpHGbI_pfA58grS8';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Error:', e);
  }
}

listModels();
