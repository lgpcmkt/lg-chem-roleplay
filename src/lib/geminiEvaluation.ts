import { RoleplayEvaluationResult, Product, Scenario, ChatMessage } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB6L2Z1hUpFpw6_e4mmH3Xm74zErCaN_HU';

export async function evaluateRoleplayWithGemini(
  product: Product,
  scenario: Scenario,
  persona: string,
  chatHistory: ChatMessage[]
): Promise<RoleplayEvaluationResult> {
  const formattedTranscript = chatHistory
    .map(msg => `${msg.role === 'user' ? '영업사원(MR)' : '의사(AI)'}: ${msg.content}`)
    .join('\n');

  const prompt = `
당신은 제약 영업(MR) 롤플레이 교육 전문가입니다. 아래 영업사원과 의사의 디테일링 대화 전문을 바탕으로 평가 리포트를 JSON 형식으로 작성해 주세요.

[디테일링 정보]
- 약품명: ${product.name} (${product.indication || ''})
- 주요 미션/특장점: ${scenario.missionMsg || ''}
- 의사 페르소나/성향: ${persona || scenario.title}

[대화 전문]
${formattedTranscript || '(대화 내용 없음)'}

[평가 가이드라인]
1. totalScore: 0 ~ 100점 사이의 정수 (대화의 충실도, 설득력, 미션 달성도 종합 평가).
2. isSuccess: totalScore가 60점 이상이거나 의사를 설득한 경우 true, 그렇지 않으면 false.
3. reasoning: 의사의 처방 변경 이유 또는 Unmet needs (의사 입장에서 느낀 총평 2~3문장).
4. strengths: 영업사원이 잘 설명하거나 잘한 점 2~3가지 (문장 배열).
5. weaknesses: 영업사원이 아쉽거나 보완해야 할 점 1~2가지 (문장 배열).
6. recommendedScript: 다음 대화 시 활용할 수 있는 1~2문장의 모범 스크립트.

[반환 형식]
오직 아래 구조의 JSON만 반환하세요:
{
  "totalScore": 85,
  "isSuccess": true,
  "reasoning": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["..."],
  "recommendedScript": "..."
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json', temperature: 0.2 }
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Gemini API 호출 한도를 초과했습니다 (429 Too Many Requests). 무료 티어 한도를 확인해주세요.');
    }
    if (response.status === 404 || response.status === 403) {
      throw new Error(`Gemini API 권한 오류 (${response.status}). Google Cloud에서 'Generative Language API'가 활성화되어 있는지 확인해주세요.`);
    }
    throw new Error(`Gemini API 오류 발생: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) {
    throw new Error('Gemini API 응답 결과가 비어 있습니다.');
  }

  const parsed = JSON.parse(rawText);
  const score = Number(parsed.totalScore) || 75;
  const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C';

  return {
    isSuccess: typeof parsed.isSuccess === 'boolean' ? parsed.isSuccess : score >= 60,
    totalScore: score,
    grade: grade,
    reasoning: parsed.reasoning || '성공적으로 디테일링을 마쳤습니다.',
    summary: `${product.name} 디테일링 평가 완료`,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    recommendedScript: parsed.recommendedScript || '',
    scores: [],
    detailedFeedback: parsed.reasoning || '',
    turnByTurnAnalysis: [],
    keyChecklistStatus: {}
  };
}
