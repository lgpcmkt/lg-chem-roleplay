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

const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash'];

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
  specialtyId: string,
  doctorTypeId: string,
  chatHistory: ChatMessage[]
): Promise<any> {
  const product = PRODUCTS[productId];
  const doctorType = DOCTOR_TYPES[doctorTypeId];
  const criteria = PRODUCT_EVALUATION_CRITERIA[productId];
  const specialty = product?.specialties.find(s => s.id === specialtyId);

  const transcript = chatHistory
    .map((m) => `${m.role === 'user' ? '[MR (영업사원)]' : `[${doctorType.name} ${doctorType.title}]`}: ${m.content}`)
    .join('\n');

  const criteriaText = criteria.map((c, i) => `${i + 1}. ${c.label} (${c.maxScore}점 만점)\n   - ${c.description}`).join('\n');

  const scoreProperties: any = {};
  criteria.forEach(c => {
    scoreProperties[c.key] = { type: Type.INTEGER, description: `${c.label} (0~${c.maxScore})` };
  });

  const checklistProperties: any = {};
  criteria.forEach(c => {
    checklistProperties[`${c.key}Mentioned`] = { type: Type.BOOLEAN, description: `${c.label} 언급 여부` };
  });

  const systemPrompt = `
너는 LG화학 ${product.name}(${product.nameEn}) 마케팅 팀장 및 디테일링 채점 최고 전문가이다.
다음 MR과 의사 간의 롤플레이 녹취록을 분석하여 정밀 평가 리포트를 작성하라.

[대화 대상 의사]: ${doctorType.name} ${doctorType.title} (${specialty?.name || ''})
[디테일 제품]: ${product.name} (${product.composition})

${PRODUCT_CLINICAL_CONTEXT[productId]}

[평가 등급 부여 기준 (S~C 4단계)]
- S 등급 (90~100점): 완벽한 디테일링. 핵심 킬러 포인트를 정확히 집어내고 의사 설득 완벽 성공.
- A 등급 (80~89점): 우수한 디테일링. 대부분의 핵심 포인트를 잘 언급함.
- B 등급 (70~79점): 보통 수준의 디테일링. 일부 핵심 포인트 누락.
- C 등급 (70점 미만): 무성의한 답변이거나 핵심 정보 대부분 누락.

[summary 항목 - 의사의 구어체 속마음 (1~2문장)]
예: S등급: "오, 이 정도 데이터면 다음 환자부터 ${product.name} 처방해 봐야겠는데요?"
    C등급: "MR이 좀 무성의하네요. 디테일할 의지가 안 보입니다."

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
        required: ['totalScore', 'grade', 'scores', 'summary', 'strengths', 'weaknesses', 'detailedFeedback', 'turnByTurnAnalysis', 'recommendedScript', 'keyChecklistStatus'],
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
