import dotenv from 'dotenv';
dotenv.config();

export async function evaluateWithElevenLabs(conversationId: string) {
  const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('[ElevenLabs] VITE_ELEVENLABS_API_KEY is missing from environment');
    throw new Error('API_KEY_MISSING: Render 환경변수에 VITE_ELEVENLABS_API_KEY를 설정해주세요.');
  }

  console.log(`[ElevenLabs] Starting evaluation for conversation: ${conversationId}`);
  console.log(`[ElevenLabs] API Key present: ${apiKey.substring(0, 8)}...`);

  const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
  
  const maxRetries = 20;
  const retryDelay = 4000; // 4 seconds between retries
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[ElevenLabs] Polling attempt ${i + 1}/${maxRetries}...`);
      
      const res = await fetch(url, {
        headers: { 'xi-api-key': apiKey }
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[ElevenLabs] API error ${res.status}: ${errText}`);
        if (res.status === 401) throw new Error('UNAUTHORIZED: API 키가 유효하지 않습니다. Render 환경변수를 확인하세요.');
        if (res.status === 404) throw new Error('NOT_FOUND: 대화 ID를 찾을 수 없습니다.');
        if (res.status === 403) throw new Error('FORBIDDEN: API 키 권한이 부족합니다.');
        throw new Error(`API_ERROR_${res.status}: ${errText.substring(0, 200)}`);
      }

      const data = await res.json();
      
      // Log the conversation status
      const convStatus = data.status;
      console.log(`[ElevenLabs] Conversation status: ${convStatus}`);
      
      // Log the full analysis structure for debugging (first attempt only or when analysis exists)
      const analysis = data.analysis;
      if (i === 0 || analysis) {
        console.log(`[ElevenLabs] Analysis exists: ${!!analysis}`);
        if (analysis) {
          console.log(`[ElevenLabs] Analysis keys: ${JSON.stringify(Object.keys(analysis))}`);
          console.log(`[ElevenLabs] evaluation_criteria_results: ${JSON.stringify(analysis.evaluation_criteria_results)}`);
          console.log(`[ElevenLabs] data_collection_results keys: ${analysis.data_collection_results ? JSON.stringify(Object.keys(analysis.data_collection_results)) : 'null'}`);
        }
      }
      
      if (analysis && analysis.evaluation_criteria_results) {
        const evalCriteria = analysis.evaluation_criteria_results;
        const dataCollection = analysis.data_collection_results || {};
        
        // Try all possible key variations for the evaluation criteria
        const rpResult = evalCriteria.rp || evalCriteria.RP || evalCriteria.roleplay || evalCriteria.Roleplay || Object.values(evalCriteria)[0];
        
        console.log(`[ElevenLabs] rpResult: ${JSON.stringify(rpResult)}`);
        
        // ElevenLabs can return either:
        // - "score" (number 0-100) for numeric evaluation
        // - "result" (string "success"/"failure"/"unknown") for boolean evaluation
        let score = 0;
        let resultStr = '';
        
        if (rpResult) {
          // Check for numeric score first
          if (typeof rpResult.score === 'number') {
            score = rpResult.score;
          } else if (typeof rpResult.score === 'string') {
            score = parseInt(rpResult.score, 10) || 0;
          }
          
          // Check for string result (success/failure)
          if (rpResult.result) {
            resultStr = rpResult.result;
            // If score is 0 but we have a result string, derive score from it
            if (score === 0) {
              if (resultStr === 'success') score = 85;
              else if (resultStr === 'failure') score = 30;
              else score = 50; // unknown
            }
          }
        }
        
        console.log(`[ElevenLabs] Derived score: ${score}, result: ${resultStr}`);
        
        // Extract data collection fields
        const strengthsStr = dataCollection.strengths?.value || dataCollection.strengths?.data || '';
        const weaknessesStr = dataCollection.weaknesses?.value || dataCollection.weaknesses?.data || '';
        const recommendedScript = dataCollection.recommended_script?.value || dataCollection.recommended_script?.data || '';
        const doctorComment = dataCollection.doctor_comment?.value || dataCollection.doctor_comment?.data || '';

        let grade: 'S' | 'A' | 'B' | 'C' = 'C';
        if (score >= 90) grade = 'S';
        else if (score >= 80) grade = 'A';
        else if (score >= 50) grade = 'B';

        const isSuccess = score >= 80;
        
        const rawReasoning = doctorComment || rpResult?.rationale || rpResult?.reason || "";
        const reasoning = rawReasoning.includes('LLM Cascade') || rawReasoning.includes('LLM Error')
          ? "대화 내용이 너무 짧거나 분석할 내용이 부족하여 AI가 채점할 수 없습니다. 롤플레잉을 조금 더 진행해 주세요."
          : rawReasoning;

        const result = {
          isSuccess,
          grade,
          totalScore: score,
          reasoning: reasoning,
          strengths: strengthsStr ? strengthsStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0) : [],
          weaknesses: weaknessesStr ? weaknessesStr.split('\n').map((s: string) => s.replace(/^(\d+\.\s*|-\s*)/, '').trim()).filter((s: string) => s.length > 0) : [],
          recommendedScript: recommendedScript,
          detailedFeedback: `총점: ${score}점 (${resultStr || 'scored'})`,
        };
        
        console.log(`[ElevenLabs] Evaluation complete: grade=${grade}, score=${score}, success=${isSuccess}`);
        return result;
      }
      
      // If analysis is not ready yet, wait and retry
      if (convStatus === 'done' && !analysis) {
        console.log(`[ElevenLabs] Conversation done but no analysis yet, waiting...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } catch (e: any) {
      console.error(`[ElevenLabs] Error on attempt ${i + 1}:`, e.message);
      // Don't retry on fatal errors
      if (e.message.startsWith('UNAUTHORIZED') || 
          e.message.startsWith('NOT_FOUND') || 
          e.message.startsWith('FORBIDDEN') ||
          e.message.startsWith('API_KEY_MISSING')) {
        throw e;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  console.error('[ElevenLabs] Polling timed out after all retries');
  return {
    isSuccess: false,
    grade: 'C' as const,
    totalScore: 0,
    reasoning: '분석 시간이 초과되었습니다. 대화가 너무 짧았거나, ElevenLabs 분석이 아직 완료되지 않았을 수 있습니다. 다시 시도해 주세요.',
    strengths: [],
    weaknesses: [],
    recommendedScript: '',
    detailedFeedback: '시간 초과',
  };
}

