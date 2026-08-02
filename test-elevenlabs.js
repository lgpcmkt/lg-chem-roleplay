import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testElevenLabs() {
  const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
  const id = 'conv_5201kz02mb19etmb0j8ky00nw4dt';
  const detailUrl = `https://api.elevenlabs.io/v1/convai/conversations/${id}`;
  try {
    const detailResponse = await fetch(detailUrl, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });
    const detailData = await detailResponse.json();
    fs.writeFileSync('elevenlabs_dump.json', JSON.stringify(detailData, null, 2));
    console.log("Saved to elevenlabs_dump.json");
  } catch(e) {
    console.error('Error:', e);
  }
}

testElevenLabs();
