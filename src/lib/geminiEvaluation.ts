import { RoleplayEvaluationResult, Product, Scenario, ChatMessage } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function evaluateRoleplayWithGemini(
  product: Product,
  scenario: Scenario,
  persona: string,
  chatHistory: ChatMessage[]
): Promise<RoleplayEvaluationResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
  }

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
1. grade: S, A, B, C 중 하나의 등급 부여.
  - S: 핵심 소구 포인트를 완벽하게 전달하고 성공적으로 설득함.
  - A: 주요 내용을 잘 전달하여 처방을 유도함.
  - B: 핵심 키워드가 일부 누락되어 설득이 다소 부족함.
  - C: 엉뚱한 내용을 말하거나 의사를 전혀 설득하지 못함.
2. isSuccess: grade가 S 또는 A이면 true, B 또는 C이면 false.
3. reasoning: 의사의 입장에서 느낀 총평 (왜 이런 등급을 주었는지, 어떤 점이 아쉬웠는지 2~3문장).
4. strengths: 영업사원이 잘한 점 2~3가지 (문장 배열).
5. weaknesses: 영업사원이 보완해야 할 핵심 키워드 누락 등 아쉬운 점 1~2가지 (문장 배열).
6. recommendedScript: 다음 대화 시 활용할 수 있는 1~2문장의 모범 스크립트.

[반환 형식]
오직 아래 구조의 JSON만 반환하세요:
{
  "grade": "A",
  "isSuccess": true,
  "reasoning": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["..."],
  "recommendedScript": "..."
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
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
  const grade = parsed.grade || 'C';
  const isSuccess = grade === 'S' || grade === 'A';

  return {
    isSuccess: isSuccess,
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
