import dotenv from 'dotenv';
dotenv.config();

export async function evaluateWithElevenLabs(conversationId: string) {
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('No ElevenLabs API key found in backend');
    return null;
  }

  const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
  
  const maxRetries = 15;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'xi-api-key': apiKey }
      });
      
      if (!res.ok) {
        console.error(`ElevenLabs API returned ${res.status}`);
        return null;
      }

      const data = await res.json();
      
      const analysis = data.analysis;
      if (analysis && analysis.data_collection_results && analysis.evaluation_criteria_results) {
        const dataCollection = analysis.data_collection_results;
        const evalCriteria = analysis.evaluation_criteria_results;
        
        // Handle case-sensitivity for 'rp' vs 'RP'
        const rpResult = evalCriteria.rp || evalCriteria.RP;
        const score = rpResult?.score || 0;
        
        const strengthsStr = dataCollection.strengths?.value || '';
        const weaknessesStr = dataCollection.weaknesses?.value || '';
        const recommendedScript = dataCollection.recommended_script?.value || '';

        let grade: 'S' | 'A' | 'B' | 'C' = 'C';
        if (score >= 90) grade = 'S';
        else if (score >= 80) grade = 'A';
        else if (score >= 70) grade = 'B';

        const isSuccess = score >= 80;
        
        return {
          isSuccess,
          grade,
          totalScore: score,
          reasoning: rpResult?.rationale || "",
          strengths: strengthsStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0),
          weaknesses: weaknessesStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0),
          recommendedScript: recommendedScript,
          detailedFeedback: "총점: " + score + "점",
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.error('Error polling ElevenLabs:', e);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.error('ElevenLabs evaluation polling timed out');
  return null;
}
