import React, { useState, useCallback, useEffect } from 'react';
import { Product, DoctorType, Specialty, ChatMessage, RoleplayEvaluationResult, SavedSession, EmployeeInfo, ScoreItem } from './types';
import { EmployeeLoginModal } from './components/EmployeeLoginModal';
import { ProductSelectScreen } from './components/ProductSelectScreen';
import { SpecialtySelectScreen } from './components/SpecialtySelectScreen';
import { DoctorTypeSelectScreen } from './components/DoctorTypeSelectScreen';
import { FlashDoctorRoom } from './components/FlashDoctorRoom';
import { WaitingRoomScreen } from './components/WaitingRoomScreen';
import { EvaluationReport } from './components/EvaluationReport';
import { Sidebar } from './components/Sidebar';
import { MyGradebook } from './components/MyGradebook';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

// ── 정적 데이터 (클라이언트용) ──
const PRODUCTS: Record<string, Product> = {
  zemidapa: {
    id: 'zemidapa', name: '제미다파', nameEn: 'Zemidapa',
    composition: '제미글립틴 50 mg + 다파글리플로진 10 mg',
    indication: '2형 당뇨병 치료 (복합제)', tagline: 'SWITCHING 연구 기반 혈당 조절 전략',
    color: 'from-blue-600 to-indigo-700', icon: '💊', imageUrl: '/images/zemidapa.jpg',
    specialties: [
      { id: 'cardio', name: '순환기내과', icon: '❤️', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&q=80', description: 'SGLT-2i 심혈관 보호 관점' },
      { id: 'endocrine', name: '내분비내과', icon: '🔬', imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&q=80', description: '당뇨 혈당 조절 전문' },
      { id: 'nephro', name: '신장내과', icon: '🫘', imageUrl: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=300&q=80', description: 'eGFR/신장 보호 관점' },
    ],
  },
  vimovo: {
    id: 'vimovo', name: '비모보', nameEn: 'VIMOVO',
    composition: '나프록센 500mg + 에스오메프라졸 20mg',
    indication: 'NSAID 위궤양 위험 관절염 환자', tagline: '5중 코팅으로 위장 보호 + 강력 소염진통',
    color: 'from-emerald-600 to-teal-700', icon: '🛡️', imageUrl: '/images/vimovo.jpg',
    specialties: [
      { id: 'rheumatology', name: '류마티스내과', icon: '🦴', imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&q=80', description: '류마티스/골관절염 전문' },
      { id: 'orthopedics', name: '정형외과', icon: '🏥', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&q=80', description: '근골격계 통증 관리' },
      { id: 'neurology', name: '신경과', icon: '🧠', imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&q=80', description: '통증/신경 질환 관점' },
    ],
  },
  nephoxil: {
    id: 'nephoxil', name: '네폭실', nameEn: 'Nephoxil',
    composition: 'Ferric citrate hydrate (구연산제이철수화물)',
    indication: '혈액투석 CKD 환자의 고인산혈증', tagline: '인 감소 + 철분 보충, 하나로 해결',
    color: 'from-orange-600 to-red-700', icon: '🩸', imageUrl: '/images/nephoxil.jpg',
    specialties: [
      { id: 'nephro_ckd', name: '신장내과', icon: '🫘', imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&q=80', description: '투석 환자 인/철분 관리' },
      { id: 'endocrine_ckd', name: '내분비내과', icon: '🔬', imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=300&q=80', description: 'CKD 대사 합병증 관리' },
      { id: 'general_internal', name: '일반내과', icon: '🩺', imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&q=80', description: '만성 질환 예방 관리' },
    ],
  },
};

const DOCTOR_TYPES: Record<string, DoctorType> = {
  strict: { id: 'strict', name: '최실리', title: '원장', avatar: '🤨', imageUrl: '/images/doctor_strict_1785238829473.png', difficulty: '상', personality: '깐깐하고 상업적. 실질적 이득을 따지는 50대 원장.', focusArea: '실질적 경영 이득, 환자 만족도, 경쟁약 차별점' },
  academic: { id: 'academic', name: '이학술', title: '교수', avatar: '👨‍🏫', imageUrl: '/images/doctor_academic_1785238840727.png', difficulty: '최상', personality: '학술적이고 냉소적이며 시니컬. P-value와 연구 디자인 중시.', focusArea: '연구 디자인, 통계 유의성, 에비던스, 가이드라인' },
  friendly: { id: 'friendly', name: '김민희', title: '과장', avatar: '👩‍⚕️', imageUrl: '/images/doctor_friendly_1785238849913.png', difficulty: '중', personality: '30대 주니어. 친화적이지만 원장님 눈치를 봄.', focusArea: '원장 보고 명분, 안전성, 가이드라인, 환자 사례' },
};

const PRODUCT_CHECKLIST: Record<string, { key: string; label: string; regex: RegExp }[]> = {
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

const PRODUCT_EVAL_CRITERIA: Record<string, { key: string; label: string; maxScore: number }[]> = {
  zemidapa: [
    { key: 'switchingStudy', label: 'SWITCHING 연구 전달', maxScore: 30 },
    { key: 'same3DrugSwitch', label: '동일 3제 교체 HbA1c', maxScore: 30 },
    { key: 'competitorSize', label: '알약 크기/순응도', maxScore: 20 },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20 },
  ],
  vimovo: [
    { key: 'coatingTech', label: '5중 코팅 기전', maxScore: 30 },
    { key: 'ulcerReduction', label: '위궤양 감소 데이터', maxScore: 30 },
    { key: 'competitorAdvantage', label: '경쟁 NSAID 장점', maxScore: 20 },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20 },
  ],
  nephoxil: [
    { key: 'phosphateBinding', label: '인결합 기전/효과', maxScore: 30 },
    { key: 'ironSupplement', label: '철분 보충 효과', maxScore: 30 },
    { key: 'kdigoGuideline', label: 'KDIGO 가이드라인', maxScore: 20 },
    { key: 'closing', label: '클로징 및 대응', maxScore: 20 },
  ],
};

type AppScreen = 'login' | 'productSelect' | 'specialtySelect' | 'doctorTypeSelect' | 'waitingRoom' | 'roleplay' | 'evaluation';
type SideView = 'dashboard' | 'gradebook';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function App() {
  // ── State ──
  const [screen, setScreen] = useState<AppScreen>('login');
  const [sideView, setSideView] = useState<SideView>('dashboard');
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);

  // Selection
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedDoctorTypeId, setSelectedDoctorTypeId] = useState<string>('');

  // Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalTurn, setIsFinalTurn] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [checklistStatus, setChecklistStatus] = useState<Record<string, boolean>>({});

  // Evaluation
  const [evaluation, setEvaluation] = useState<RoleplayEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Sessions
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const stored = localStorage.getItem('lg_roleplay_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Google Sheets
  const [sheetsModal, setSheetsModal] = useState<{ open: boolean; mode: 'single' | 'bulk' }>({ open: false, mode: 'single' });

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('lg_roleplay_sessions', JSON.stringify(savedSessions));
  }, [savedSessions]);

  // ── Derived ──
  const selectedProduct = PRODUCTS[selectedProductId] || null;
  const selectedSpecialty = selectedProduct?.specialties.find(s => s.id === selectedSpecialtyId) || null;
  const selectedDoctorType = DOCTOR_TYPES[selectedDoctorTypeId] || null;
  const checklistItems = PRODUCT_CHECKLIST[selectedProductId] || [];

  // ── Handlers ──
  const handleLogin = (info: EmployeeInfo) => {
    setEmployeeInfo(info);
    setScreen('productSelect');
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setScreen('specialtySelect');
  };

  const handleSelectSpecialty = (specialtyId: string) => {
    setSelectedSpecialtyId(specialtyId);
    setScreen('doctorTypeSelect');
  };

  const handleSelectDoctorType = (doctorTypeId: string) => {
    setSelectedDoctorTypeId(doctorTypeId);
    setScreen('waitingRoom');
  };

  const handleEnterRoleplay = () => {
    // Reset chat
    setChatHistory([]);
    setIsFinalTurn(false);
    setTurnCount(0);
    setEvaluation(null);

    // Initialize checklist
    const initialChecklist: Record<string, boolean> = {};
    (PRODUCT_CHECKLIST[selectedProductId] || []).forEach(item => { initialChecklist[item.key] = false; });
    setChecklistStatus(initialChecklist);

    // Generate initial greeting
    const product = PRODUCTS[selectedProductId];
    const doctorType = DOCTOR_TYPES[selectedDoctorTypeId];
    const specialty = product?.specialties.find(s => s.id === selectedSpecialtyId);
    const mrName = employeeInfo?.name || 'MR';

    let greeting = '';
    if (selectedDoctorTypeId === 'strict') {
      greeting = `네, 오셨어요 ${mrName} 담당자님? 바쁜 시간 내는 건데.. 오늘 ${product?.name || '제품'} 어떤 내용을 디테일하러 오셨나요?`;
    } else if (selectedDoctorTypeId === 'academic') {
      greeting = `들어오세요, ${mrName} 담당자님. 외래 중간이라 2분밖에 없습니다. 오늘 ${product?.name || '제품'} 어떤 내용을 디테일하러 오셨나요?`;
    } else {
      greeting = `아 네, 어서 오세요 ${mrName} 담당자님. 저희 원장님이 아직 진료 중이셔서.. 짧게만 들을 수 있어요. 오늘 ${product?.name || '제품'} 어떤 내용을 디테일하러 오셨나요?`;
    }

    setChatHistory([{
      id: generateId(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toISOString(),
    }]);

    setScreen('roleplay');
  };

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Update checklist
    const items = PRODUCT_CHECKLIST[selectedProductId] || [];
    setChecklistStatus(prev => {
      const updated = { ...prev };
      items.forEach(item => {
        if (!updated[item.key] && item.regex.test(message)) {
          updated[item.key] = true;
        }
      });
      return updated;
    });

    try {
      const historyForApi = [...chatHistory, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/doctor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          specialtyId: selectedSpecialtyId,
          doctorTypeId: selectedDoctorTypeId,
          chatHistory: historyForApi,
          userMessage: message,
          userName: employeeInfo?.name,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply || '네, 좀 더 구체적으로 설명해 주시겠습니까?',
        timestamp: new Date().toISOString(),
      };

      setChatHistory(prev => [...prev, assistantMsg]);
      setIsFinalTurn(data.isFinalTurn || false);
      setTurnCount(data.turnCount || 0);
    } catch (err) {
      console.error('Error:', err);
      setChatHistory(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '네, 방금 하신 말씀 좀 더 자세히 설명해 주시겠습니까?',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory, selectedProductId, selectedSpecialtyId, selectedDoctorTypeId, employeeInfo]);

  const handleEndRoleplay = useCallback(async () => {
    setIsEvaluating(true);
    setScreen('evaluation');

    try {
      const historyForApi = chatHistory.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          specialtyId: selectedSpecialtyId,
          doctorTypeId: selectedDoctorTypeId,
          chatHistory: historyForApi,
        }),
      });

      const data = await res.json();

      // Transform scores to ScoreItem[]
      const criteria = PRODUCT_EVAL_CRITERIA[selectedProductId] || [];
      const scoreItems: ScoreItem[] = criteria.map(c => ({
        key: c.key,
        label: c.label,
        score: data.scores?.[c.key] ?? 0,
        maxScore: c.maxScore,
      }));

      const evalResult: RoleplayEvaluationResult = {
        ...data,
        scores: scoreItems,
      };

      setEvaluation(evalResult);

      // Save session
      const newSession: SavedSession = {
        id: generateId(),
        date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        productId: selectedProductId,
        productName: selectedProduct?.name || '',
        specialtyName: selectedSpecialty?.name || '',
        doctorTypeName: selectedDoctorType ? `${selectedDoctorType.name} ${selectedDoctorType.title}` : '',
        evaluation: evalResult,
        chatHistory,
      };
      setSavedSessions(prev => [newSession, ...prev]);
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluation({
        totalScore: 70, grade: 'B',
        scores: (PRODUCT_EVAL_CRITERIA[selectedProductId] || []).map(c => ({ key: c.key, label: c.label, score: Math.round(c.maxScore * 0.7), maxScore: c.maxScore })),
        summary: '평가 중 오류가 발생했습니다. 다시 시도해 주세요.',
        strengths: ['디테일링을 완료함'], weaknesses: ['평가 데이터 부족'],
        detailedFeedback: '', turnByTurnAnalysis: [], recommendedScript: '',
        keyChecklistStatus: {},
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [chatHistory, selectedProductId, selectedSpecialtyId, selectedDoctorTypeId, selectedProduct, selectedSpecialty, selectedDoctorType]);

  const handleRetry = () => {
    handleSelectDoctorType(selectedDoctorTypeId);
  };

  const handleNewProduct = () => {
    setScreen('productSelect');
    setSelectedProductId('');
    setSelectedSpecialtyId('');
    setSelectedDoctorTypeId('');
    setChatHistory([]);
    setEvaluation(null);
    setIsFinalTurn(false);
  };

  const handleLogout = () => {
    setEmployeeInfo(null);
    setSelectedProductId('');
    setSelectedSpecialtyId('');
    setSelectedDoctorTypeId('');
    setChatHistory([]);
    setEvaluation(null);
    setIsFinalTurn(false);
    setScreen('login');
  };

  const handleNavigate = (view: string) => {
    setSideView(view as SideView);
    if (view === 'dashboard' && screen === 'evaluation') {
      handleNewProduct();
    } else if (view === 'dashboard') {
      if (screen !== 'roleplay') setScreen('productSelect');
    }
  };

  const handleDeleteSession = (id: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== id));
  };

  // ── Render ──
  if (screen === 'login') {
    return <EmployeeLoginModal isOpen={true} onSave={handleLogin} currentInfo={employeeInfo} />;
  }

  const renderMainContent = () => {
    if (sideView === 'gradebook') {
      return (
        <MyGradebook
          sessions={savedSessions}
          onDeleteSession={handleDeleteSession}
          onExportAll={() => setSheetsModal({ open: true, mode: 'bulk' })}
        />
      );
    }

    switch (screen) {
      case 'productSelect':
        return (
          <ProductSelectScreen
            products={Object.values(PRODUCTS)}
            onSelectProduct={handleSelectProduct}
            employeeName={employeeInfo?.name || 'MR'}
          />
        );
      case 'specialtySelect':
        return selectedProduct ? (
          <SpecialtySelectScreen
            product={selectedProduct}
            onSelectSpecialty={handleSelectSpecialty}
            onBack={() => setScreen('productSelect')}
          />
        ) : null;
      case 'doctorTypeSelect':
        return selectedProduct ? (
          <DoctorTypeSelectScreen
            product={selectedProduct}
            specialtyName={selectedSpecialty?.name || ''}
            doctorTypes={Object.values(DOCTOR_TYPES)}
            onSelectDoctorType={handleSelectDoctorType}
            onBack={() => setScreen('specialtySelect')}
          />
        ) : null;
      case 'waitingRoom':
        return selectedDoctorType ? (
          <WaitingRoomScreen 
            doctorType={selectedDoctorType} 
            onEnter={handleEnterRoleplay} 
          />
        ) : null;
      case 'roleplay':
        return selectedProduct && selectedSpecialty && selectedDoctorType ? (
          <FlashDoctorRoom
            product={selectedProduct}
            specialty={selectedSpecialty}
            doctorType={selectedDoctorType}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onEndRoleplay={handleEndRoleplay}
            isLoading={isLoading}
            isFinalTurn={isFinalTurn}
            turnCount={turnCount}
            checklistStatus={checklistStatus}
            checklistItems={checklistItems.map(i => ({ key: i.key, label: i.label }))}
          />
        ) : null;
      case 'evaluation':
        if (isEvaluating) {
          return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
              <div className="text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div>
                  <p className="text-base font-extrabold text-slate-900">AI가 평가 중입니다...</p>
                  <p className="text-xs text-slate-500 mt-1">디테일링 내용을 분석하고 있습니다.</p>
                </div>
              </div>
            </div>
          );
        }
        return evaluation && selectedProduct && selectedSpecialty && selectedDoctorType ? (
          <EvaluationReport
            evaluation={evaluation}
            product={selectedProduct}
            specialty={selectedSpecialty}
            doctorType={selectedDoctorType}
            onRetry={handleRetry}
            onNewProduct={handleNewProduct}
            onExportSheets={() => setSheetsModal({ open: true, mode: 'single' })}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col-reverse md:flex-row bg-slate-50 overflow-hidden">
      <Sidebar
        employeeInfo={employeeInfo}
        currentView={sideView === 'gradebook' ? 'gradebook' : 'dashboard'}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-[env(safe-area-inset-bottom)]">
        {renderMainContent()}
      </main>

      <GoogleSheetsModal
        isOpen={sheetsModal.open}
        onClose={() => setSheetsModal({ open: false, mode: 'single' })}
        evaluation={evaluation}
        productName={selectedProduct?.name || ''}
        specialtyName={selectedSpecialty?.name || ''}
        doctorTypeName={selectedDoctorType ? `${selectedDoctorType.name} ${selectedDoctorType.title}` : ''}
        employeeInfo={employeeInfo}
        savedSessions={savedSessions}
        mode={sheetsModal.mode}
      />
    </div>
  );
}
