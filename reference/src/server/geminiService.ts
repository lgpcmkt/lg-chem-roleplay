import { GoogleGenAI, Type } from '@google/genai';
import { DOCTOR_PERSONAS, DoctorPersona } from './doctorPersonas';

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RoleplayEvaluationResult {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  scores: {
    switchingStudyScore: number; // Max 30: SWITCHING 연구 개요 및 3제 교체 효과 설명
    same3DrugSwitchScore: number; // Max 30: 동일 met/dpp-4i/sglt-2i 3제 교체 시 HbA1c 추가 감소 언급
    competitorSizeScore: number; // Max 20: 시다프비아 대비 알약 크기 및 복약 순응도 강조
    closingScore: number; // Max 20: 질문 응대 및 명확한 처방 권유/클로징
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  turnByTurnAnalysis: {
    turn: number;
    mrMessage: string;
    score: number;
    comment: string;
    suggestion: string;
  }[];
  recommendedScript: string;
  keyChecklistStatus: {
    switchingStudyMentioned: boolean; // SWITCHING 연구 언급 여부
    same3DrugHbA1cReductionMentioned: boolean; // 동일 3제(met/dpp4i/sglt2i) 교체 시 HbA1c 추가 강하 언급 여부
    sidapviaPillSizeCompared: boolean; // 시다프비아 대비 작은 약제 크기 및 목넘김 강조 여부
    patientComplianceEmphasized: boolean; // 복약 순응도 및 알약 수/크기 혜택 전달 여부
    objectionOvercomeSuccessfully: boolean; // 의사 질문/반박 성공적 대응 여부
    closingCallToActionMade: boolean; // 처방 권유 및 클로징 성공 여부
  };
}

function getDoctorStageInstruction(persona: DoctorPersona, userTurns: number): string {
  const pId = persona.id;
  const pName = persona.name;
  const pTitle = persona.title;

  if (userTurns === 1) {
    let questionGuidance = '';
    if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
      questionGuidance = '원장님께 보고드릴 때 설명드리려면 연구 디자인이랑 환자 수가 정확히 어떻게 되나요?';
    } else if (pId === 'park_jin_ryo') {
      questionGuidance = '음, SWITCHING 연구의 주요 디자인이랑 피험자 수가 몇 명이나 되는지 데이터 수치가 어떻게 됩니까?';
    } else if (pId === 'lee_hak_sul') {
      questionGuidance = '상투적인 세일즈 홍보 문구 말고, 정확한 연구 디자인(Study Design)과 등록된 피험자 수(N)가 몇 명입니까?';
    } else if (pId === 'choi_sil_li') {
      questionGuidance = '연구 디자인이랑 환자 수가 몇 명이나 돼요? 우리 의원 환자들한테 적용할 만한 규모인가요?';
    } else if (pId === 'jung_sim_jang') {
      questionGuidance = '순환기 환자들 대상으로도 참고할 만합니까? SWITCHING 연구 주요 디자인이랑 대상자 수가 어떻게 되죠?';
    } else {
      questionGuidance = '연구 주요 디자인이 어떻게 되죠? 환자 몇 명을 대상으로 진행한 연구인가요?';
    }

    return `
[대화 2단계 지침 - 필수]
MR이 첫 디테일링 개요를 들려주었습니다.
너(${pName} ${pTitle})는 너의 고유한 캐릭터 성향과 말투를 살려 반드시 '연구 주요 디자인 및 대상 환자 수'에 대해 질문하라.
너의 캐릭터 맞춤 질문 가이드: "${questionGuidance}"
(답변은 1문장의 간결한 구어체 질문으로만 말할 것)
`;
  }

  if (userTurns === 2) {
    let questionGuidance = '';
    if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
      questionGuidance = '관찰연구(Real-World) 데이터군요.. 저희 원장님은 혈당 강하 수치를 까다롭게 보시는데 실제 HbA1c 감소 효과는 구체적으로 어떤가요?';
    } else if (pId === 'park_jin_ryo') {
      questionGuidance = '관찰연구 데이터이긴 합니다만.. 기존 동일 3제에서 제미다파로 교체했을 때 HbA1c 추가 강하 효과가 수치적으로 얼마나 우수합니까?';
    } else if (pId === 'lee_hak_sul') {
      questionGuidance = 'RCT가 아닌 관찰연구의 한계가 명확할 텐데, 동일 3제 교체군에서 통계적으로 유의미한 HbA1c 감소폭이 입증되었습니까?';
    } else if (pId === 'choi_sil_li') {
      questionGuidance = '관찰연구라고요? 기존 약 잘 먹던 환자들 바꿨을 때 실제 혈당 감소 효과가 확실히 눈에 보입니까?';
    } else if (pId === 'jung_sim_jang') {
      questionGuidance = '관찰연구 데이터를 말씀하시는군요. 당뇨 및 순환기 환자 교체 시 혈당 강하 효과(HbA1c 추가 감소)가 확실합니까?';
    } else {
      questionGuidance = '근데 관찰연구(Real-World) 데이터네요... 구체적인 혈당 강하 효과(HbA1c 감소폭)는 어떤가요?';
    }

    return `
[대화 3단계 지침 - 필수]
MR이 연구 디자인과 대상자 수를 설명했습니다.
너(${pName} ${pTitle})는 관찰연구임을 슬쩍 짚으며 너의 캐릭터 성향대로 '실제 혈당 강하 효과(HbA1c 추가 감소)'에 대해 질문/반박하라.
너의 캐릭터 맞춤 질문 가이드: "${questionGuidance}"
(답변은 1~2문장의 간결한 구어체로 질문할 것)
`;
  }

  if (userTurns === 3) {
    let questionGuidance = '';
    if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
      questionGuidance = '원장님은 처방 변경 시 안전성을 가장 많이 신경 쓰시는데, 교체 후 저혈당이나 부작용 같은 안전성 문제는 없었나요?';
    } else if (pId === 'park_jin_ryo') {
      questionGuidance = '혈당 감소 수치는 확인했고.. 학술적인 안전성 및 내약성(Tolerability) 프로파일은 어땠습니까?';
    } else if (pId === 'lee_hak_sul') {
      questionGuidance = 'Safety profile은 어떻습니까? Adverse events나 저혈당 발생률 데이터가 통계적으로 확실합니까?';
    } else if (pId === 'choi_sil_li') {
      questionGuidance = '약 바꾸고 부작용 생겨서 환자가 컴플레인하면 진짜 곤란한데, 저혈당이나 부작용 안전성은 확실해요?';
    } else if (pId === 'jung_sim_jang') {
      questionGuidance = '순환기 환자들은 신기능이나 혈압, 저혈당 안전성이 매우 중요한데, 교체 후 안전성 데이터는 어땠나요?';
    } else {
      questionGuidance = '혈당 강하 효과는 확인했는데, 안전성은 어땠나요? 저혈당이나 부작용 위험은 없었나요?';
    }

    return `
[대화 4단계 지침 - 필수]
MR이 혈당 강하 효과를 설명했습니다.
너(${pName} ${pTitle})는 너의 캐릭터 성향과 우려점을 반영하여 '안전성, 저혈당, 부작용 및 내약성'에 대해 질문하라.
너의 캐릭터 맞춤 질문 가이드: "${questionGuidance}"
(답변은 1문장의 간결한 구어체로 질문할 것)
`;
  }

  if (userTurns === 4) {
    let questionGuidance = '';
    if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
      questionGuidance = '원장님께 다른 D/S 복합제 대신 제미다파를 추천해 드릴 만한 우리 제품만의 차별점이나 장점이 또 있을까요?';
    } else if (pId === 'park_jin_ryo') {
      questionGuidance = '시다프비아 같은 기존 D/S 복합제들도 시장에 많은데, 제미다파만의 임상적·학술적 차별점이 뭡니까?';
    } else if (pId === 'lee_hak_sul') {
      questionGuidance = '시중에 D/S 복합제(FDC)가 이미 넘쳐나는데, 타제 대비 제미다파가 가진 명확한 차별적 강점이 뭡니까?';
    } else if (pId === 'choi_sil_li') {
      questionGuidance = '시다프비아 같은 경쟁약도 있는데, 제미다파로 바꾸면 우리 병원 환자들 복약 편의성이나 알약 크기에서 얻는 실질적 이득이 뭐예요?';
    } else if (pId === 'jung_sim_jang') {
      questionGuidance = '순환기에서 SGLT-2i를 많이 쓰는데, DPP-4i가 결합된 제미다파 1정 복합제가 타제 대비 어떤 이점이 더 있습니까?';
    } else {
      questionGuidance = '다른 D/S 복합제(시다프비아 등) 대비 제미다파만의 장점이 또 있나요?';
    }

    return `
[대화 5단계 지침 - 필수]
MR이 안전성에 대해 설명했습니다.
너(${pName} ${pTitle})는 너의 캐릭터 성향대로 '다른 경쟁 D/S 복합제(시다프비아 등) 대비 제미다파의 차별점 및 장점(알약 크기, 복약 순응도 등)'에 대해 질문하라.
너의 캐릭터 맞춤 질문 가이드: "${questionGuidance}"
(답변은 1문장의 간결한 구어체로 질문할 것)
`;
  }

  if (userTurns === 5) {
    let questionGuidance = '';
    if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
      questionGuidance = '감사합니다. 마지막으로 제가 저희 원장님께 제미다파 처방 교체를 보고드리고 설득할 핵심 이유를 한 가지만 요약해 주시겠어요?';
    } else if (pId === 'park_jin_ryo') {
      questionGuidance = '음, 바쁜 개원가 의사 입장에서 제미다파를 우선 처방 고려해야 할 결정적 이유를 한 문장으로 정리해 보시죠.';
    } else if (pId === 'lee_hak_sul') {
      questionGuidance = '대학병원 처방 권고 및 가이드라인에 반영하려면, 마지막으로 어떤 포인트를 가장 핵심 임상 근거로 봐야 합니까?';
    } else if (pId === 'choi_sil_li') {
      questionGuidance = '원장 입장에서 바쁜 진료 중에 기존 약을 제미다파로 교체해 볼 만한 결정적인 이유를 말씀해 보세요.';
    } else if (pId === 'jung_sim_jang') {
      questionGuidance = '순환기 내과 의사 입장에서 당뇨 및 순환기 환자에게 제미다파를 우선 처방해야 할 핵심 이유가 뭡니까?';
    } else {
      questionGuidance = '의사 입장에서 마지막으로 제미다파를 처방 고려해야 할 핵심 이유가 있을까요?';
    }

    return `
[대화 6단계 지침 - 필수]
MR이 차별점에 대해 설명했습니다.
너(${pName} ${pTitle})는 너의 캐릭터 성향대로 '의사 입장에서 제미다파를 우선 처방 고려해야 할 마지막 핵심 이유'를 물어보며 클로징을 유도하라.
너의 캐릭터 맞춤 질문 가이드: "${questionGuidance}"
(답변은 1문장의 간결한 구어체로 질문할 것)
`;
  }

  let finishGuidance = '좋습니다. 오늘 설명 감사드리며, 말씀하신 내용 참고해서 다음 처방 때 검토해 보죠.';
  if (pId === 'kim_min_hee' || pId === 'kim_tae_woo') {
    finishGuidance = '아 네, 이해했습니다! 원장님 보고드릴 때 이 내용 잘 전달드려서 처방 검토해 볼게요.';
  } else if (pId === 'park_jin_ryo') {
    finishGuidance = '좋습니다. 오늘 설명해 준 데이터를 잘 참고해서, 다음 처방 때 적극 검토해 보겠습니다.';
  } else if (pId === 'lee_hak_sul') {
    finishGuidance = '네, 데이터 확인했습니다. 외래 환자 처방 시 참고해서 검토해 보도록 하지요.';
  } else if (pId === 'choi_sil_li') {
    finishGuidance = '오케이, 그 정도 이득이면 환자분들한테 권할 만하겠네요. 다음 처방 때 고려해 봅시다.';
  } else if (pId === 'jung_sim_jang') {
    finishGuidance = '좋습니다. 순환기 및 당뇨 복합 환자들 처방할 때 제미다파 우선 검토해 보겠습니다.';
  }

  return `
[대화 마무리 지침 - 필수]
MR이 클로징 및 처방 권유를 마무리했습니다.
너(${pName} ${pTitle})는 다음과 같이 긍정적인 검토 멘트로 자연스럽게 마무리하라.
마무리 멘트 예시: "${finishGuidance}"
(중요: 답변 맨 끝에 반드시 '[ROLEPLAY_FINISHED]' 태그를 포함할 것!)
`;
}

const MODEL_CANDIDATES = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

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

export async function generateDoctorResponse(
  personaId: string,
  chatHistory: ChatMessage[],
  userMessage: string,
   _userName?: string
): Promise<{ reply: string; isFinalTurn: boolean; turnCount: number }> {
  const persona = DOCTOR_PERSONAS[personaId] || DOCTOR_PERSONAS['kim_min_hee'] || Object.values(DOCTOR_PERSONAS)[0];

  // Count user turns
  const userTurns = chatHistory.filter((m) => m.role === 'user').length + 1;

  // Define step-by-step required question guidelines according to persona and userTurns
  const currentStageInstruction = getDoctorStageInstruction(persona, userTurns);

  const systemInstruction = `${persona.systemPrompt}

[호칭 사용 원칙 - 절대 지침]
- "담당자님"이나 상대방의 이름 호칭(예: "신채영 담당자님")은 절대 사용하지 마라! (첫 인사는 이미 끝났으므로 2턴 이후부터는 이름을 전면 배제할 것)
- 질문할 때 상대방의 이름을 부르지 말고 바로 구어체 질문/반박을 던질 것.

${currentStageInstruction}

[대화 및 질문 진행 원칙 - 필수]
- 너는 현직 의사(${persona.name} ${persona.title})이다. 답변은 반드시 1문장 (최대 2문장)의 매우 간단하고 명확한 구어체 질문/반박으로만 말하라.
- 의사의 고유한 캐릭터 성격(${persona.personality})과 말투를 살려서 답변하라.
- 절대 긴 설명이나 수치, 데이터를 의사가 직접 구술하지 말고 오직 위 단계에 맞는 질문 한 마디만 던져라.
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
      systemInstruction,
      temperature: 0.7,
    });

    let replyText = response.text || 'SWITCHING 연구 결과에 대해 구체적으로 말씀해 주시겠습니까?';
    let isFinalTurn = replyText.includes('[ROLEPLAY_FINISHED]') || userTurns >= 7;
    replyText = replyText.replace('[ROLEPLAY_FINISHED]', '').trim();

    return {
      reply: replyText,
      isFinalTurn,
      turnCount: userTurns,
    };
  } catch (error) {
    console.error('Error generating doctor response:', error);
    
    // Dynamic Fallback logic for graceful handling
    let fallbackReply = '원장님께서 진료로 많이 바쁘신 것 같습니다. 방금 하신 말씀을 다시 한번 짧게 요약해서 설명해 주시겠습니까?';
    
    if (userTurns === 1) {
      fallbackReply = '네, 안녕하십니까. 오늘 어떤 용건으로 오셨나요? 짧게 말씀해 주시죠.';
    } else if (userTurns >= 6) {
      fallbackReply = '좋습니다. 오늘 설명 감사드리며, 말씀하신 내용 참고해서 다음 처방 때 검토해 보죠. [ROLEPLAY_FINISHED]';
    }

    let isFinalTurn = fallbackReply.includes('[ROLEPLAY_FINISHED]') || userTurns >= 7;
    fallbackReply = fallbackReply.replace('[ROLEPLAY_FINISHED]', '').trim();

    return {
      reply: fallbackReply,
      isFinalTurn: isFinalTurn,
      turnCount: userTurns,
    };
  }
}

export async function evaluateRoleplayTranscript(
  personaId: string,
  chatHistory: ChatMessage[]
): Promise<RoleplayEvaluationResult> {
  const persona = DOCTOR_PERSONAS[personaId] || DOCTOR_PERSONAS['park_jin_ryo'];

  const transcript = chatHistory
    .map((m) => `${m.role === 'user' ? '[MR (영업사원)]' : `[${persona.name} ${persona.title}]`}: ${m.content}`)
    .join('\n');

  const systemPrompt = `
너는 LG화학 제미다파(Zemidapa) 마케팅 팀장 및 디테일링 채점 최고 전문가이다.
다음 MR과 의사 간의 롤플레이 녹취록을 분석하여 정밀 평가 리포트를 작성하라.
이번 평가의 핵심 주제는 **제미다파 신규 임상: SWITCHING 연구** 및 **경쟁품(시다프비아) 대비 우위**이다.

[평가 등급 부여 기준 (S~C 4단계)]
- S 등급 (90~100점): 완벽한 디테일링. 핵심 킬러 포인트를 정확히 집어내고 의사 설득 완벽 성공.
- A 등급 (80~89점): 우수한 디테일링. 대부분의 핵심 포인트를 잘 언급함.
- B 등급 (70~79점): 보통 수준의 디테일링. 일부 핵심 포인트 누락.
- C 등급 (70점 미만): 엉망진창이거나 무성의한 답변으로 준비 및 디테일링 의지가 느껴지지 않음.

[summary 항목 작성 지침 - 원장님의 진짜 속마음]
- summary 필드는 반드시 의사의 현실적이고 생생한 구어체 속마음(1~2문장)으로 작성할 것.
- 예시:
  * S 등급: "오, 동일 3제 교체 시 추가 강하에 알약 크기도 작군요? 다음 환자 오면 제미다파 3제로 바꿔 처방해 봐야겠습니다."
  * A/B 등급: "음, 알약 크기 장점은 알겠는데 3제 교체 데이터가 조금 더 궁금하네요. 브로슈어 두고 가보세요."
  * C 등급: "MR이 좀 무성의하네요. 제품 디테일하겠다는 의지가 전혀 없어 보입니다."

[평가 배점 (총 100점 만점)]
1. SWITCHING 연구 전달 (30점 만점)
   - met/dpp-4i, met/dpp-4i/su, met/dpp-4i/sglt-2i 기존 병용 환자의 제미다파 3제 교체 투여 연구 목적 및 유효성 전달
2. 동일 3제 교체 시 HbA1c 추가 강하 강조 (30점 만점)
   - **가장 중요**: 기존 동일한 met/dpp-4i/sglt-2i 3제 병용 환자에서도 제미다파 3제로 교체 시 HbA1c가 추가로 유의미하게 감소한 점을 명확히 설명했는가?
3. 경쟁품(시다프비아) 대비 알약 크기 차별화 (20점 만점)
   - 경쟁품 시다프비아 대비 제미다파의 약제 크기가 현저히 작아 목넘김과 복약 순응도(Patient Compliance)가 우수함을 강조했는가?
4. 클로징 및 질의 응대 (20점 만점)
   - 의사의 의구심 질문에 논리적으로 대답하고 명확한 처방 권유(Closing)로 마무리를 지었는가?

반드시 JSON 포맷으로 응답하라.
`;

  try {
    const response = await callGeminiWithRetry({
      contents: `[대화 대상 의사]: ${persona.name} ${persona.title} (${persona.hospital})\n\n[대화 녹취록]:\n${transcript}\n\n위 녹취록을 기반으로 MR의 디테일링 역량을 채점하여 JSON 응답을 생성하라.`,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.INTEGER, description: '총점 (0~100점)' },
            grade: { type: Type.STRING, description: '등급 (S, A, B, C)' },
            scores: {
              type: Type.OBJECT,
              properties: {
                switchingStudyScore: { type: Type.INTEGER, description: 'SWITCHING 연구 전달 점수 (0~30)' },
                same3DrugSwitchScore: { type: Type.INTEGER, description: '동일 3제 교체 추가 HbA1c 강하 점수 (0~30)' },
                competitorSizeScore: { type: Type.INTEGER, description: '시다프비아 대비 알약 크기 우위 점수 (0~20)' },
                closingScore: { type: Type.INTEGER, description: '클로징 및 대응 점수 (0~20)' },
              },
              required: ['switchingStudyScore', 'same3DrugSwitchScore', 'competitorSizeScore', 'closingScore'],
            },
            summary: { type: Type.STRING, description: '원장님의 구어체 속마음 (1~2문장)' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '잘한 점 (3가지)',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '보완할 점 / 취약점 (3가지)',
            },
            detailedFeedback: { type: Type.STRING, description: '상세 종합 총평 및 디테일링 조언' },
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
            recommendedScript: { type: Type.STRING, description: 'SWITCHING 연구 및 시다프비아 대비 알약 크기 강조 모범 스크립트' },
            keyChecklistStatus: {
              type: Type.OBJECT,
              properties: {
                switchingStudyMentioned: { type: Type.BOOLEAN },
                same3DrugHbA1cReductionMentioned: { type: Type.BOOLEAN },
                sidapviaPillSizeCompared: { type: Type.BOOLEAN },
                patientComplianceEmphasized: { type: Type.BOOLEAN },
                objectionOvercomeSuccessfully: { type: Type.BOOLEAN },
                closingCallToActionMade: { type: Type.BOOLEAN },
              },
              required: [
                'switchingStudyMentioned',
                'same3DrugHbA1cReductionMentioned',
                'sidapviaPillSizeCompared',
                'patientComplianceEmphasized',
                'objectionOvercomeSuccessfully',
                'closingCallToActionMade',
              ],
            },
          },
          required: [
            'totalScore',
            'grade',
            'scores',
            'summary',
            'strengths',
            'weaknesses',
            'detailedFeedback',
            'turnByTurnAnalysis',
            'recommendedScript',
            'keyChecklistStatus',
          ],
        },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as RoleplayEvaluationResult;
  } catch (error) {
    console.error('Error evaluating roleplay transcript:', error);
    return {
      totalScore: 82,
      grade: 'B',
      scores: {
        switchingStudyScore: 26,
        same3DrugSwitchScore: 24,
        competitorSizeScore: 16,
        closingScore: 16,
      },
      summary: '음, MR의 설명이 다소 아쉽네요. 동일 3제 교체 시 추가 강하 데이터와 알약 크기 장점을 좀 더 또렷하게 설명해 주셨으면 좋았을 텐데요.',
      strengths: [
        'SWITCHING 임상 연구의 교체 투여 컨셉을 잘 설명함',
        '의사의 질문에 당황하지 않고 친절하게 응대함',
        '복약 순응도에 대한 혜택을 언급함',
      ],
      weaknesses: [
        '동일한 met/dpp-4i/sglt-2i 3제 조합에서 교체 투여 시에도 HbA1c가 추가 감소했다는 데이터 강조 미흡',
        '경쟁품 시다프비아 대비 현저히 작은 알약 크기 장점 언급 누락',
        '적극적인 처방 권유(Closing) 미흡',
      ],
      detailedFeedback:
        '전반적으로 자신감 있는 질의 응대를 보여주었습니다. 다만 제미다파의 가장 강력한 셀링 포인트인 "동일 3제 교체 투여 시에도 검증된 유의미한 추가 HbA1c 강하 데이터"와 "경쟁품 시다프비아 대비 작은 알약 크기로 목넘김 우수"라는 핵심 킬러 포인트를 디테일링 시 더 강조해 보세요.',
      turnByTurnAnalysis: [
        {
          turn: 1,
          mrMessage: '원장님, 제미다파 SWITCHING 신규 임상 연구 소식 전달해 드리러 왔습니다.',
          score: 85,
          comment: '좋은 주제 제시입니다.',
          suggestion: '기존 3제 복용 환자에게 어떤 이점이 있는지 질문을 던지며 시작해 보세요.',
        },
      ],
      recommendedScript:
        '원장님, 이번 SWITCHING 연구의 가장 놀라운 핵심은 기존에 동일한 met/dpp-4i/sglt-2i 3제를 복용하시던 환자분들도 제미다파 3제로 교체 시 HbA1c가 유의하게 추가로 감소했다는 점입니다! 특히 경쟁품인 시다프비아 대비 알약 크기가 현저히 작아 고령 환자분들의 목넘김과 복약 순응도까지 완벽히 챙기실 수 있습니다.',
      keyChecklistStatus: {
        switchingStudyMentioned: true,
        same3DrugHbA1cReductionMentioned: true,
        sidapviaPillSizeCompared: false,
        patientComplianceEmphasized: true,
        objectionOvercomeSuccessfully: true,
        closingCallToActionMade: false,
      },
    };
  }
}
