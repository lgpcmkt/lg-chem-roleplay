import dotenv from 'dotenv';
dotenv.config();

export async function evaluateWithElevenLabs(conversationId: string) {
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('No ElevenLabs API key found in backend');
    throw new Error('API_KEY_MISSING');
  }

  const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
  
  const maxRetries = 15;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'xi-api-key': apiKey }
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error(`ElevenLabs API returned ${res.status}: ${errText}`);
        if (res.status === 401) throw new Error('UNAUTHORIZED_OR_INVALID_KEY');
        if (res.status === 404) throw new Error('NOT_FOUND_CONVERSATION');
        throw new Error(`API_ERROR_${res.status}`);
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
        const doctorComment = dataCollection.doctor_comment?.value || '';

        let grade: 'S' | 'A' | 'B' | 'C' = 'C';
        if (score >= 90) grade = 'S';
        else if (score >= 80) grade = 'A';
        else if (score >= 50) grade = 'B';

        const isSuccess = score >= 80;
        
        return {
          isSuccess,
          grade,
          totalScore: score,
          reasoning: doctorComment || rpResult?.rationale || "",
          strengths: strengthsStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0),
          weaknesses: weaknessesStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0),
          recommendedScript: recommendedScript,
          detailedFeedback: "총점: " + score + "점",
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e: any) {
      console.error('Error polling ElevenLabs:', e);
      if (e.message === 'UNAUTHORIZED_OR_INVALID_KEY' || e.message === 'NOT_FOUND_CONVERSATION') {
        throw e; // Do not retry on these fatal errors
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.error('ElevenLabs evaluation polling timed out or failed to extract criteria');
  return {
    isSuccess: false,
    grade: 'C',
    totalScore: 0,
    reasoning: '대화가 너무 짧거나 명확한 정보가 부족하여 AI가 채점을 완료하지 못했습니다.',
    strengths: [],
    weaknesses: [],
    recommendedScript: '',
    detailedFeedback: '오류: 채점 기준 누락',
  };
}
