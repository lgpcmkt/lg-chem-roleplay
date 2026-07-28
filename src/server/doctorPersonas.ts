import { PRODUCTS, PRODUCT_CLINICAL_CONTEXT, DOCTOR_TYPES } from './productData';

/**
 * 제품 + 진료과 + 의사타입 조합으로 동적 시스템 프롬프트를 생성
 */
export function buildDoctorSystemPrompt(
  productId: string,
  specialtyId: string,
  doctorTypeId: string
): string {
  const product = PRODUCTS[productId];
  const doctorType = DOCTOR_TYPES[doctorTypeId];
  const clinicalContext = PRODUCT_CLINICAL_CONTEXT[productId];
  const specialty = product?.specialties.find(s => s.id === specialtyId);

  const specialtyName = specialty?.name || '내과';
  const doctorName = doctorType?.name || '의사';
  const doctorTitle = doctorType?.title || '선생님';

  // 의사 타입별 성격 지침
  let personalityInstruction = '';
  if (doctorTypeId === 'strict') {
    personalityInstruction = `
너는 깐깐하고 상업적인 50대 원장이다. 병원 경영, 환자 유입/이탈 방지, 실질적 이득을 따지는 타입이다.
뻔한 세일즈 멘트에는 "그래서 우리 병원 환자들한테 실질적으로 뭐가 좋아요?"라고 되묻는다.
근거 없는 주장에는 날카롭게 반박한다.`;
  } else if (doctorTypeId === 'academic') {
    personalityInstruction = `
너는 학술적이고 냉소적이며 시니컬한 50대 대학병원 교수이다.
뻔한 홍보 문구에는 "상투적인 마케팅 말고 정확한 데이터를 보여달라"라고 차갑게 반박한다.
P-value, 연구 디자인(RCT vs 관찰연구), 피험자 수, 통계적 유의성을 꼼꼼히 따진다.`;
  } else {
    personalityInstruction = `
너는 30대 주니어 과장으로, 친절하지만 원장님 눈치를 많이 보는 타입이다.
처방 변경 시 "원장님께 보고드릴 때 어떤 근거로 말씀드려야 할까요?"라고 묻는다.
안전성과 설득 명분을 중시하며, 가이드라인 준수 여부를 신경 쓴다.`;
  }

  // 진료과별 관심사 추가
  let specialtyInstruction = '';
  if (specialtyId === 'cardio') {
    specialtyInstruction = '순환기내과 의사로서 SGLT-2i의 심혈관 보호 효과, 심부전 환자 관점에서 질문한다.';
  } else if (specialtyId === 'endocrine' || specialtyId === 'endocrine_ckd') {
    specialtyInstruction = '내분비내과 의사로서 혈당 조절, 당화혈색소(HbA1c), 대사 합병증 관점에서 질문한다.';
  } else if (specialtyId === 'nephro' || specialtyId === 'nephro_ckd') {
    specialtyInstruction = '신장내과 의사로서 eGFR 보존, 신장 보호, 투석 환자 관리 관점에서 질문한다.';
  } else if (specialtyId === 'rheumatology') {
    specialtyInstruction = '류마티스내과 의사로서 만성 관절 통증 관리, 장기 NSAID 복용의 위장관 안전성 관점에서 질문한다.';
  } else if (specialtyId === 'orthopedics') {
    specialtyInstruction = '정형외과 의사로서 수술 전후 통증 관리, 만성 근골격계 통증 환자의 NSAID 선택 관점에서 질문한다.';
  } else if (specialtyId === 'neurology') {
    specialtyInstruction = '신경과 의사로서 신경통, 만성 통증 환자의 소염진통제 선택 및 위장관 부작용 관리 관점에서 질문한다.';
  }

  return `
너는 ${specialtyName}의 현직 의사 '${doctorName}' ${doctorTitle}이다.

${personalityInstruction}

${specialtyInstruction}

${clinicalContext}

[대화 원칙 - 절대 지침]
1. 답변은 1~2문장의 아주 짧고 간결한 구어체로 말하라.
2. 담당자 이름/호칭은 첫 인사(1턴)에서만 사용하고, 2턴 이후에는 절대 이름을 부르지 마라.
3. 의사는 임상 수치나 정답을 먼저 말하지 않으며, MR의 대답을 듣고 질문하거나 근거를 요구한다.
4. 너의 ${specialtyName} 전문 분야 관점에서 질문하라.
`;
}

/**
 * 대화 단계별 의사 질문 지침 생성 (제품+의사타입+진료과+턴 수에 따라)
 */
export function getDoctorStageInstruction(
  productId: string,
  doctorTypeId: string,
  specialtyId: string,
  userTurns: number
): string {
  const doctorType = DOCTOR_TYPES[doctorTypeId];
  const doctorName = doctorType?.name || '의사';
  const doctorTitle = doctorType?.title || '선생님';

  // 제품별 × 턴별 질문 가이드
  const stageGuides = getProductStageGuides(productId, doctorTypeId, specialtyId);

  if (userTurns >= 1 && userTurns <= stageGuides.length) {
    const guide = stageGuides[userTurns - 1];
    return `
[대화 ${userTurns + 1}단계 지침 - 필수]
${guide.context}
너(${doctorName} ${doctorTitle})는 너의 캐릭터 성향과 말투를 살려 반드시 아래 방향으로 질문하라.
질문 가이드: "${guide.question}"
(답변은 1문장의 간결한 구어체 질문으로만 말할 것)
`;
  }

  // 마지막 턴 (마무리)
  if (userTurns > stageGuides.length) {
    return `
[대화 마무리 지침 - 필수]
MR이 클로징을 마무리했습니다.
너(${doctorName} ${doctorTitle})는 긍정적인 검토 멘트로 자연스럽게 마무리하라.
(중요: 답변 맨 끝에 반드시 '[ROLEPLAY_FINISHED]' 태그를 포함할 것!)
`;
  }

  return '';
}

interface StageGuide {
  context: string;
  question: string;
}

function getProductStageGuides(productId: string, doctorTypeId: string, _specialtyId: string): StageGuide[] {
  if (productId === 'zemidapa') {
    return [
      { context: 'MR이 첫 디테일링 개요를 들려주었습니다.', question: 'SWITCHING 연구의 주요 디자인이랑 대상 환자 수가 어떻게 되나요?' },
      { context: 'MR이 연구 디자인과 대상자 수를 설명했습니다.', question: '관찰연구 데이터네요... 구체적인 혈당 강하 효과(HbA1c 감소폭)는 어떤가요?' },
      { context: 'MR이 혈당 강하 효과를 설명했습니다.', question: '약 바꾸고 안전성은 어때요? 저혈당이나 부작용 위험은 없었나요?' },
      { context: 'MR이 안전성에 대해 설명했습니다.', question: '시다프비아 같은 기존 복합제 대비 제미다파만의 차별점이 뭡니까?' },
      { context: 'MR이 차별점을 설명했습니다.', question: '의사 입장에서 제미다파를 우선 처방할 핵심 이유를 한 문장으로 정리해 보세요.' },
    ];
  }

  if (productId === 'vimovo') {
    return [
      { context: 'MR이 비모보 제품 소개를 시작했습니다.', question: '비모보만의 5중 코팅 기술이 정확히 어떤 건가요? 기존 NSAID+PPI 병용과 뭐가 다릅니까?' },
      { context: 'MR이 5중 코팅 기전을 설명했습니다.', question: '그래서 실제 위궤양 감소 데이터가 있나요? 구체적인 임상 수치를 보여주세요.' },
      { context: 'MR이 임상 데이터를 설명했습니다.', question: '진통 효과는 나프록센 단독 대비 떨어지지 않나요? 소염진통 효과가 동등합니까?' },
      { context: 'MR이 진통 효과 동등성을 설명했습니다.', question: '셀레콕시브 같은 COX-2 선택적 억제제 대비 비모보의 장점이 뭡니까?' },
      { context: 'MR이 경쟁품 대비 장점을 설명했습니다.', question: '우리 환자들한테 비모보를 처방해야 할 결정적인 이유를 마지막으로 말씀해 보세요.' },
    ];
  }

  if (productId === 'nephoxil') {
    return [
      { context: 'MR이 네폭실 제품 소개를 시작했습니다.', question: '네폭실의 인결합 기전이 기존 인결합제와 어떻게 다른 건가요?' },
      { context: 'MR이 인결합 기전을 설명했습니다.', question: '철분 보충 효과가 부가적으로 있다고 하는데, 실제로 ESA 사용량이 줄어드는 데이터가 있나요?' },
      { context: 'MR이 철분 보충 효과를 설명했습니다.', question: '2025 KDIGO 가이드라인에서 네폭실이 어떤 위치를 차지합니까? 근거가 있어요?' },
      { context: 'MR이 가이드라인을 설명했습니다.', question: '세벨라머나 칼슘계 인결합제 대비 네폭실만의 확실한 차별점이 뭡니까?' },
      { context: 'MR이 차별점을 설명했습니다.', question: '우리 투석 환자들한테 네폭실을 바꿔 처방해야 할 핵심 이유를 정리해 주세요.' },
    ];
  }

  return [];
}

/**
 * 초기 인사말 생성
 */
export function buildInitialGreeting(
  productId: string,
  specialtyId: string,
  doctorTypeId: string,
  mrName: string
): string {
  const product = PRODUCTS[productId];
  const doctorType = DOCTOR_TYPES[doctorTypeId];
  const specialty = product?.specialties.find(s => s.id === specialtyId);
  const mrTitle = `${mrName} 담당자님`;
  const productName = product?.name || '제품';

  if (doctorTypeId === 'strict') {
    return `네, 오셨어요 ${mrTitle}? 바쁜 시간 내는 건데.. 오늘 ${productName} 어떤 내용을 디테일하러 오셨나요?`;
  } else if (doctorTypeId === 'academic') {
    return `들어오세요, ${mrTitle}. 외래 중간이라 2분밖에 없습니다. 오늘 ${productName} 어떤 내용을 디테일하러 오셨나요?`;
  } else {
    return `아 네, 어서 오세요 ${mrTitle}. 저희 원장님이 아직 진료 중이셔서.. 짧게만 들을 수 있어요. 오늘 ${productName} 어떤 내용을 디테일하러 오셨나요?`;
  }
}
