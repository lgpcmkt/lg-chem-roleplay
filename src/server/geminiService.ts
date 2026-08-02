import { GoogleGenAI, Type } from '@google/genai';
import { PRODUCTS, DOCTOR_TYPES, PRODUCT_EVALUATION_CRITERIA, PRODUCT_CLINICAL_CONTEXT } from './productData';
import { buildDoctorSystemPrompt, getDoctorStageInstruction } from './doctorPersonas';

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MODEL_CANDIDATES = ['gemini-flash-latest'];

async function callGeminiWithRetry(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
}): Promise<any> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;
        if (params.temperature !== undefined) config.temperature = params.temperature;

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[GeminiService] Model ${model} attempt ${attempt} failed:`, error?.message || error);
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }
    }
  }

  throw lastError || new Error('All model candidates failed');
}

/**
 * 의사 AI 응답 생성
 */
export async function generateDoctorResponse(
  productId: string,
  specialtyId: string,
  doctorTypeId: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  _userName?: string
): Promise<{ reply: string; isFinalTurn: boolean; turnCount: number }> {
  const userTurns = chatHistory.filter((m) => m.role === 'user').length + 1;

  const systemPrompt = buildDoctorSystemPrompt(productId, specialtyId, doctorTypeId);
  const stageInstruction = getDoctorStageInstruction(productId, doctorTypeId, specialtyId, userTurns);

  const fullSystemInstruction = `${systemPrompt}

${stageInstruction}

[호칭 사용 원칙 - 절대 지침]
- 2턴 이후부터는 "담당자님"이나 상대방의 이름 호칭을 절대 사용하지 마라!
- 바로 구어체 질문/반박을 던질 것.

[대화 원칙 - 필수]
- 답변은 반드시 1문장 (최대 2문장)의 매우 간단하고 명확한 구어체 질문/반박으로만 말하라.
- 절대 긴 설명이나 수치, 데이터를 의사가 직접 구술하지 말고 위 단계에 맞는 질문 한 마디만 던져라.
`;

  const contents = [
    ...chatHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const response = await callGeminiWithRetry({
      contents: contents as any,
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    });

    let replyText = response.text || '네, 좀 더 구체적으로 설명해 주시겠습니까?';
    let isFinalTurn = replyText.includes('[ROLEPLAY_FINISHED]') || userTurns >= 7;
    replyText = replyText.replace('[ROLEPLAY_FINISHED]', '').trim();

    return { reply: replyText, isFinalTurn, turnCount: userTurns };
  } catch (error) {
    console.error('Error generating doctor response:', error);

    let fallbackReply = '네, 방금 하신 말씀을 다시 한번 짧게 요약해서 설명해 주시겠습니까?';
    if (userTurns >= 6) {
      fallbackReply = '좋습니다. 오늘 설명 감사드리며, 말씀하신 내용 참고해서 다음 처방 때 검토해 보죠.';
    }

    return {
      reply: fallbackReply,
      isFinalTurn: userTurns >= 6,
      turnCount: userTurns,
    };
  }
}

/**
 * 롤플레이 평가 리포트 생성
 */
export async function evaluateRoleplayTranscript(
  productId: string,
  scenarioTitle: string,
  chatHistory: ChatMessage[],
  elevenLabsData?: { isSuccess: boolean; rationale: string; transcript_summary?: string }
): Promise<any> {
  const product = PRODUCTS[productId];
  const criteria = PRODUCT_EVALUATION_CRITERIA[productId];

  const transcript = chatHistory
    .map((m) => `${m.role === 'user' ? '[MR (영업사원)]' : `[의사]`}: ${m.content}`)
    .join('\n');

  const criteriaText = criteria.map((c, i) => `${i + 1}. ${c.label} (${c.maxScore}점 만점)\n   - ${c.description}`).join('\n');

  const scoreProperties: any = {};
  criteria.forEach(c => {
    scoreProperties[c.key] = { type: Type.INTEGER, description: `${c.label} (0~${c.maxScore}점)` };
  });

  const checklistProperties: any = {};
  criteria.forEach(c => {
    checklistProperties[`${c.key}Mentioned`] = { type: Type.BOOLEAN, description: `${c.label} 언급 여부` };
  });

  const systemPrompt = `
너는 LG화학 ${product.name}(${product.nameEn}) 마케팅 팀장 및 디테일링 채점 최고 전문가이다.
다음 MR과 의사 간의 롤플레이 녹취록을 분석하여 정밀 평가 리포트를 작성하라.

[대화 대상 의사 성향]: ${scenarioTitle}
[디테일 제품]: ${product.name} (${product.composition})

${PRODUCT_CLINICAL_CONTEXT[productId]}

[평가 등급 부여 기준 (S~C 4단계)]
- S 등급 (90~100점): 완벽한 디테일링. 핵심 킬러 포인트를 정확히 집어내고 의사 설득 완벽 성공. (처방 유도 성공)
- A 등급 (80~89점): 우수한 디테일링. 대부분의 핵심 포인트를 잘 언급함. (처방 유도 성공)
- B 등급 (70~79점): 보통 수준의 디테일링. 일부 핵심 포인트 누락. (처방 유도 실패)
- C 등급 (70점 미만): 무성의한 답변이거나 핵심 정보 대부분 누락. (처방 유도 실패)

[isSuccess 및 reasoning 작성 가이드]
${elevenLabsData 
  ? `ElevenLabs의 평가 결과(isSuccess: ${elevenLabsData.isSuccess})를 반드시 100% 동일하게 따르고, ElevenLabs의 코멘트("${elevenLabsData.rationale}")를 바탕으로 reasoning(처방 성공/실패 사유)을 더욱 구체적이고 전문적으로 2~3문장으로 다듬어라. 점수(총점) 또한 ElevenLabs의 성공 여부(성공시 80점 이상, 실패시 80점 미만)에 맞게 알아서 조정하라.`
  : `총점 80점 이상이면 isSuccess: true, 미만이면 false. reasoning에는 처방 성공/실패 사유를 상세하게 작성하라. 형식: "어떤 점은 매우 잘 설명되어 설득력이 있었지만, 어떤 점은 부족했습니다. 따라서 ~~~해서 처방을 변경하기로 결심했습니다."`
}

[summary 항목 - 의사의 구어체 속마음 (1~2문장)]
${elevenLabsData && elevenLabsData.transcript_summary 
  ? `ElevenLabs의 대화 요약("${elevenLabsData.transcript_summary}")을 바탕으로, 의사 입장에서의 속마음을 구어체로 1~2문장으로 작성하라.` 
  : `예: S등급: "오, 이 정도 데이터면 다음 환자부터 ${product.name} 처방해 봐야겠는데요?"\n    C등급: "MR이 좀 무성의하네요. 디테일할 의지가 안 보입니다."`
}

[평가 배점 (총 100점 만점)]
${criteriaText}

반드시 JSON 포맷으로 응답하라.
`;

  try {
    const response = await callGeminiWithRetry({
      contents: `[대화 녹취록]:\n${transcript}\n\n위 녹취록을 기반으로 MR의 디테일링 역량을 채점하여 JSON 응답을 생성하라.`,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isSuccess: { type: Type.BOOLEAN, description: '처방 유도 성공 여부 (80점 이상 true)' },
          reasoning: { type: Type.STRING, description: '처방 변경 이유 또는 Unmet needs에 대한 구체적이고 상세한 설명 (어떤점이 좋았고 어떤점이 부족했는지)' },
          totalScore: { type: Type.INTEGER, description: '총점 (0~100점)' },
          grade: { type: Type.STRING, description: '등급 (S, A, B, C)' },
          scores: {
            type: Type.OBJECT,
            properties: scoreProperties,
            required: Object.keys(scoreProperties),
          },
          summary: { type: Type.STRING, description: '의사 구어체 속마음 (1~2문장)' },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '잘한 점 (3가지)' },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: '보완할 점 (3가지)' },
          detailedFeedback: { type: Type.STRING, description: '상세 종합 총평' },
          turnByTurnAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                turn: { type: Type.INTEGER },
                mrMessage: { type: Type.STRING },
                score: { type: Type.INTEGER },
                comment: { type: Type.STRING },
                suggestion: { type: Type.STRING },
              },
              required: ['turn', 'mrMessage', 'score', 'comment', 'suggestion'],
            },
          },
          recommendedScript: { type: Type.STRING, description: '모범 디테일링 스크립트' },
          keyChecklistStatus: {
            type: Type.OBJECT,
            properties: checklistProperties,
            required: Object.keys(checklistProperties),
          },
        },
        required: ['isSuccess', 'reasoning', 'totalScore', 'grade', 'scores', 'summary', 'strengths', 'weaknesses', 'detailedFeedback', 'turnByTurnAnalysis', 'recommendedScript', 'keyChecklistStatus'],
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Error evaluating roleplay transcript:', error);
    // Fallback
    const fallbackScores: any = {};
    criteria.forEach(c => { fallbackScores[c.key] = Math.round(c.maxScore * 0.7); });
    const fallbackChecklist: any = {};
    criteria.forEach(c => { fallbackChecklist[`${c.key}Mentioned`] = true; });

    return {
      isSuccess: false,
      reasoning: '어떤 점은 설명이 되었으나, 임상 데이터와 관련된 구체적인 입증이 부족했습니다. 따라서 이번에는 처방을 유지하기로 했습니다.',
      totalScore: 75,
      grade: 'B',
      scores: fallbackScores,
      summary: '설명이 다소 아쉽지만 기본적인 포인트는 전달되었습니다. 핵심 킬러 포인트를 좀 더 강조해 보세요.',
      strengths: ['제품의 기본 특징을 잘 설명함', '의사 질문에 당황하지 않고 응대함', '전반적인 태도가 좋음'],
      weaknesses: ['핵심 임상 데이터의 구체적 수치 부족', '경쟁품 대비 차별점 강조 미흡', '적극적인 클로징 부족'],
      detailedFeedback: '전반적으로 기본기를 갖추고 있으나, 핵심 셀링 포인트를 더 구체적인 데이터와 함께 전달하면 좋겠습니다.',
      turnByTurnAnalysis: [],
      recommendedScript: '핵심 임상 데이터와 경쟁품 대비 차별점을 명확히 전달하고, 적극적인 처방 권유로 마무리하세요.',
      keyChecklistStatus: fallbackChecklist,
    };
  }
}

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
          reasoning: "일레븐랩스 에이전트 평가가 성공적으로 완료되었습니다.",
          strengths: strengthsStr.split('\n').map((s: string) => s.replace(/^- /, '').trim()).filter((s: string) => s.length > 0),
          weaknesses: weaknessesStr.split('\n').map((s: string) => s.replace(/^- /, '').trim()).filter((s: string) => s.length > 0),
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
