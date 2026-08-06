import { Product, DoctorType } from '../types';

// ══════════════════════════════════════════════
// 3개 제품 정의
// ══════════════════════════════════════════════

export const PRODUCTS: Record<string, Product> = {
  zemidapa: {
    id: 'zemidapa',
    name: '제미다파',
    nameEn: 'Zemidapa',
    composition: '제미글립틴 50mg + 다파글리플로진 10mg (DPP-4i + SGLT-2i FDC)',
    indication: '2형 당뇨병 치료 (복합제)',
    tagline: 'SWITCHING 연구 기반 혈당 조절 전략',
    color: 'from-blue-600 to-indigo-700',
    icon: '💊',
    imageUrl: '/images/zemidapa.jpg',
    specialties: [
      { id: 'cardio', name: '순환기내과', icon: '❤️', description: 'SGLT-2i 심혈관 보호 관점' },
      { id: 'endocrine', name: '내분비내과', icon: '🔬', description: '당뇨 혈당 조절 전문' },
      { id: 'nephro', name: '신장내과', icon: '🫘', description: 'eGFR/신장 보호 관점' },
    ],
  },
  vimovo: {
    id: 'vimovo',
    name: '비모보',
    nameEn: 'VIMOVO',
    composition: '나프록센 500mg + 에스오메프라졸 20mg',
    indication: 'NSAID 위궤양 위험 관절염 환자',
    tagline: '5중 코팅으로 위장 보호 + 강력 소염진통',
    color: 'from-emerald-600 to-teal-700',
    icon: '🛡️',
    imageUrl: '/images/vimovo.jpg',
    specialties: [
      { id: 'rheumatology', name: '류마티스내과', icon: '🦴', description: '류마티스/골관절염 전문' },
      { id: 'orthopedics', name: '정형외과', icon: '🏥', description: '근골격계 통증 관리' },
      { id: 'neurology', name: '신경과', icon: '🧠', description: '통증/신경 질환 관점' },
    ],
  },
  nephoxil: {
    id: 'nephoxil',
    name: '네폭실',
    nameEn: 'Nephoxil',
    composition: 'Ferric citrate hydrate (구연산제이철수화물)',
    indication: '혈액투석 CKD 환자의 고인산혈증',
    tagline: '인 감소 + 철분 보충, 하나로 해결',
    color: 'from-orange-600 to-red-700',
    icon: '🩸',
    imageUrl: '/images/nephoxil.jpg',
    specialties: [
      { id: 'nephro_ckd', name: '신장내과', icon: '🫘', description: '투석 환자 인/철분 관리' },
      { id: 'endocrine_ckd', name: '내분비내과', icon: '🔬', description: 'CKD 대사 합병증 관리' },
    ],
  },
};

// ══════════════════════════════════════════════
// 3종 의사 타입
// ══════════════════════════════════════════════

export const DOCTOR_TYPES: Record<string, DoctorType> = {
  strict: {
    id: 'strict',
    name: '최실리 원장',
    title: '원장',
    avatar: '🤨',
    imageUrl: '/images/doctor_strict_1785238829473.png',
    difficulty: '상',
    personality: '깐깐하고 상업적. 병원 경영, 환자 유입/이탈 방지, 실질적 이득을 따짐. 근거 없는 홍보에 예민.',
    focusArea: '실질적 경영 이득, 환자 만족도, 경쟁약 대비 차별점',
  },
  academic: {
    id: 'academic',
    name: '이학술 교수',
    title: '교수',
    avatar: '👨‍🏫',
    imageUrl: '/images/doctor_academic_1785238840727.png',
    difficulty: '최상',
    personality: '학술적이고 냉소적이며 시니컬. 뻔한 세일즈 멘트를 차갑게 반박. P-value와 연구 디자인 중시.',
    focusArea: '연구 디자인, 통계적 유의성, 에비던스 수준, 가이드라인 반영 여부',
  },
  friendly: {
    id: 'friendly',
    name: '김민희 과장',
    title: '과장',
    avatar: '👩‍⚕️',
    imageUrl: '/images/doctor_friendly_1785238849913.png',
    difficulty: '중',
    personality: '30대 주니어. 친화적이지만 고객 눈치를 봄. 처방 변경 시 안전성과 설득 명분을 염려.',
    focusArea: '고객 보고 명분, 안전성, 가이드라인 준수, 환자 사례',
  },
};

// ══════════════════════════════════════════════
// 제품별 임상 데이터 컨텍스트
// ══════════════════════════════════════════════

export const PRODUCT_CLINICAL_CONTEXT: Record<string, string> = {
  zemidapa: `
[핵심 임상 백그라운드: 제미다파 SWITCHING 연구 & 시다프비아 대비 경쟁력]

1. SWITCHING 연구 개요:
   - 기존 DPP-4i 기반 2제/3제 병용 요법(met/dpp-4i, met/dpp-4i/su, met/dpp-4i/sglt-2i)으로 혈당 조절이 불충분한 2형 당뇨병 환자를 대상으로, 메트포르민 + 제미다파(제미글립틴 50mg + 다파글리플로진 10mg) 3제 요법으로 교체(Switching) 투여 시의 유효성 및 안전성을 평가함.
   - 핵심 결과 1: 기존 met/dpp-4i, met/dpp-4i/su에서 교체 투여 시 혈당 강하 효과 유의하게 우수.
   - 핵심 결과 2 (가장 중요): 기존 동일한 met/dpp-4i/sglt-2i 3제 병용 환자에서 메트포르민 + 제미다파 3제로 교체했음에도 불구하고 HbA1c가 추가로 유의미하게 감소함!
   - 안전성: 저혈당 위험 증가 없이 우수한 내약성 및 안전성 확인.

2. 경쟁품(시다프비아) 대비 장점:
   - 약제 크기(Tablet Size): 시다프비아 대비 제미다파정은 알약 크기가 현저히 작음.
   - 복약 순응도: 목넘김이 용이하여 고령 및 다약제 복용 환자의 복약 순응도(Patient Compliance) 향상.
   - 1일 1회 1정 강력한 제미글립틴(DPP-4i) + 다파글리플로진(SGLT-2i) FDC.
`,

  vimovo: `
[핵심 임상 백그라운드: 비모보 VIMOVO - NSAID+PPI 5중 코팅 복합제]

1. 제품 개요:
   - 비모보(VIMOVO)는 비스테로이드성 소염진통제(NSAID)인 나프록센(Naproxen 500mg)과 위산분비억제제(PPI)인 에스오메프라졸(Esomeprazole 20mg)의 복합제.
   - 적응증: NSAID 관련 위궤양 위험이 있는 골관절염, 류마티스관절염, 강직성 척추염 환자의 증상 치료.

2. 5중 코팅 기술 (핵심 차별점):
   - 속방형 에스오메프라졸: 복용 후 위에서 즉시 방출 → 위 내 pH 조절, 위 점막 보호.
   - 장용성 나프록센: 위 보호막 형성 후 소장에서 나프록센 방출·흡수 → 직접적 위 점막 손상 최소화.

3. 핵심 임상 데이터:
   - 연구 PN400-301: 비모보 투여군 4.1% vs 나프록센 단독군 23.1% (위궤양 발생률)
   - 연구 PN400-302: 비모보 투여군 7.1% vs 나프록센 단독군 24.3%
   - 동등한 진통 효과를 유지하면서 위장관 부작용을 대폭 감소.

4. 경쟁 NSAID 대비 장점:
   - 별도 PPI를 추가로 복용할 필요 없이 1정으로 소염진통+위보호 동시 해결.
   - 기존 NSAID(셀레콕시브, 이부프로펜 등) 장기 복용 환자에서 위장관 안전성 우려를 한 번에 해결.
   - 고령 환자, 다약제 복용 환자의 복약 순응도 향상.
`,

  nephoxil: `
[핵심 임상 백그라운드: 네폭실 Nephoxil - 고인산혈증 치료제]

1. 제품 개요:
   - 네폭실(Nephoxil, 성분 Ferric citrate hydrate/구연산제이철수화물)은 혈액투석을 받는 만성 신장질환(CKD) 환자의 고인산혈증 치료제.
   - 철분 기반의 비칼슘계 인결합제로, 인(Phosphorus) 감소와 부가적 철분(Iron) 보충 효과를 동시에 제공.

2. 핵심 임상 특징:
   - 인결합(Phosphate binding): 경구 복용 시 위장관 내에서 인과 결합 → 인 흡수 억제 → 혈청 인 농도 감소.
   - 부가적 철분 보충: 인결합 과정에서 일부 철분이 체내 흡수 → 철분 수치 향상.
   - ESA/철분 주사제 사용량 감소: 경구 철분 보충으로 조혈제(ESA) 및 정맥 철분 주사제 사용량 줄일 수 있음 → 환자 경제적 부담 완화, QoL 개선.

3. KDIGO 가이드라인 부합:
   - 2025 KDIGO 빈혈 치료 가이드라인에서 철분 관련 지표 모니터링 주기를 3개월→1개월로 단축 권고.
   - CKD 5단계 환자에게 적극적 철분 관리를 강화하는 방향 → 네폭실은 인결합+철분보충 기능을 동시에 갖추어 가이드라인에 부합.

4. 경쟁품(칼슘계 인결합제, 세벨라머 등) 대비 장점:
   - 칼슘계 인결합제: 혈관 석회화 위험 증가 우려 → 네폭실은 비칼슘계로 안전.
   - 세벨라머: 알약 크기 크고 복용 수 많음, 철분 보충 효과 없음 → 네폭실은 인결합+철분 보충 동시 해결.
`,
};

// ══════════════════════════════════════════════
// 제품별 평가 기준 (항목 4개, 총 100점)
// ══════════════════════════════════════════════

export interface EvaluationCriteria {
  key: string;
  label: string;
  maxScore: number;
  description: string;
}

export const PRODUCT_EVALUATION_CRITERIA: Record<string, EvaluationCriteria[]> = {
  zemidapa: [
    { key: 'switchingStudy', label: 'SWITCHING 연구 전달', maxScore: 30, description: '기존 DPP-4i 기반 환자의 제미다파 3제 교체 연구 목적 및 유효성 전달' },
    { key: 'same3DrugSwitch', label: '동일 3제 교체 HbA1c 강하', maxScore: 30, description: '동일 met/dpp-4i/sglt-2i 3제에서 교체 시에도 HbA1c 추가 감소 강조' },
    { key: 'competitorSize', label: '시다프비아 대비 알약 크기', maxScore: 20, description: '경쟁품 대비 작은 알약 크기 및 복약 순응도 강조' },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20, description: '의사 질문 대응 및 처방 권유 마무리' },
  ],
  vimovo: [
    { key: 'coatingTech', label: '5중 코팅 기전 설명', maxScore: 30, description: '속방형 에스오메프라졸+장용성 나프록센 기전 전달' },
    { key: 'ulcerReduction', label: '위궤양 감소 임상데이터', maxScore: 30, description: 'PN400-301/302 임상 수치(4.1% vs 23.1%) 정확 전달' },
    { key: 'competitorAdvantage', label: '경쟁 NSAID 대비 장점', maxScore: 20, description: '별도 PPI 불필요, 1정 복합제 편의성 강조' },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20, description: '의사 질문 대응 및 처방 권유 마무리' },
  ],
  nephoxil: [
    { key: 'phosphateBinding', label: '인결합 기전 및 효과', maxScore: 30, description: '철분 기반 비칼슘계 인결합제의 인 감소 기전 설명' },
    { key: 'ironSupplement', label: '부가적 철분 보충 효과', maxScore: 30, description: 'ESA/철분 주사제 감소, 경제적 부담 완화 강조' },
    { key: 'kdigoGuideline', label: 'KDIGO 가이드라인 부합', maxScore: 20, description: '2025 KDIGO 빈혈 가이드라인 방향성 연계' },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20, description: '의사 질문 대응 및 처방 권유 마무리' },
  ],
};

// ══════════════════════════════════════════════
// 제품별 체크리스트 키워드 (실시간 미션 체크)
// ══════════════════════════════════════════════

export interface ChecklistItem {
  key: string;
  label: string;
  regex: RegExp;
}

export const PRODUCT_CHECKLIST: Record<string, ChecklistItem[]> = {
  zemidapa: [
    { key: 'switchingStudy', label: 'SWITCHING 연구', regex: /switching|스위칭|교체|switch/i },
    { key: 'hba1c', label: 'HbA1c 강하', regex: /hba1c|혈당|강하|당화혈색소/i },
    { key: 'tabletSize', label: '알약 크기 강조', regex: /크기|목넘김|시다프비아|순응도|작은|알약/i },
    { key: 'safety', label: '안전성', regex: /안전|저혈당|부작용|내약성/i },
    { key: 'closing', label: '클로징', regex: /처방|추천|권유|사용|적용/i },
  ],
  vimovo: [
    { key: 'coating', label: '5중 코팅 기전', regex: /코팅|속방|장용|에스오메프라졸|방출/i },
    { key: 'ulcerData', label: '위궤양 임상데이터', regex: /위궤양|4\.1|23\.1|PN400|위장관/i },
    { key: 'compliance', label: '1정 복합 편의성', regex: /1정|복합|ppi|편의|순응도/i },
    { key: 'safety', label: '안전성', regex: /안전|부작용|심혈관|위장/i },
    { key: 'closing', label: '클로징', regex: /처방|추천|권유|사용|적용/i },
  ],
  nephoxil: [
    { key: 'phosphate', label: '인결합 기전', regex: /인결합|인산|phosphate|인 감소|비칼슘/i },
    { key: 'iron', label: '철분 보충', regex: /철분|iron|ferric|esa|주사제|보충/i },
    { key: 'kdigo', label: 'KDIGO 가이드라인', regex: /kdigo|가이드라인|빈혈|모니터링/i },
    { key: 'competitor', label: '경쟁품 차별', regex: /세벨라머|칼슘계|석회화|경쟁/i },
    { key: 'closing', label: '클로징', regex: /처방|추천|권유|사용|적용/i },
  ],
};
