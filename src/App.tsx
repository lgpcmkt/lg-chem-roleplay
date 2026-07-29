import React, { useState, useCallback, useEffect } from 'react';
import { Product, Scenario, ChatMessage, RoleplayEvaluationResult, SavedSession, EmployeeInfo, ScoreItem } from './types';
import { EmployeeLoginModal } from './components/EmployeeLoginModal';
import { ProductSelectScreen } from './components/ProductSelectScreen';
import { ScenarioSelectScreen } from './components/ScenarioSelectScreen';
import { FlashDoctorRoom } from './components/FlashDoctorRoom';
import { EvaluationReport } from './components/EvaluationReport';
import { Sidebar } from './components/Sidebar';
import { MyGradebook } from './components/MyGradebook';
import { ConversationProvider } from '@elevenlabs/react';

// ── 정적 데이터 (클라이언트용) ──
const PRODUCTS: Record<string, Product> = {
  zemidapa: {
    id: 'zemidapa', name: '제미다파', nameEn: 'Zemidapa',
    composition: '제미글립틴 50 mg + 다파글리플로진 10 mg',
    indication: '2형 당뇨병 치료 (복합제)', tagline: 'SWITCHING 연구 기반 혈당 조절 전략',
    color: 'from-blue-600 to-indigo-700', icon: '💊', imageUrl: '/images/zemidapa.jpg',
    specialties: [], 
  },
  vimovo: {
    id: 'vimovo', name: '비모보', nameEn: 'VIMOVO',
    composition: '나프록센 500mg + 에스오메프라졸 20mg',
    indication: 'NSAID 위궤양 위험 관절염 환자', tagline: '5중 코팅으로 위장 보호 + 강력 소염진통',
    color: 'from-emerald-600 to-teal-700', icon: '🛡️', imageUrl: '/images/vimovo.jpg',
    specialties: [],
  },
  nephoxil: {
    id: 'nephoxil', name: '네폭실', nameEn: 'Nephoxil',
    composition: 'Ferric citrate hydrate (구연산제이철수화물)',
    indication: '고인산혈증 및 철결핍성 빈혈', tagline: '인 감소와 철분 보충을 동시에',
    color: 'from-orange-600 to-amber-700', icon: '🩸', imageUrl: '/images/nephoxil.jpg',
    specialties: [],
  }
};

const SCENARIOS: Record<string, Scenario[]> = {
  zemidapa: [
    { id: 'z1', title: '시다프비아 선호 고객', name: '김제미 원장', description: '', difficulty: '중급', personaImage: '/images/doctor_z1_1785320119267.png', hashtags: ['#스위칭연구', '#혈당강하 효과', '#작은 약제크기'], missionMsg: '시다프비아 선호 고객에게 제미다파의 이점을 설명하고, 처방을 유도해내세요!' },
    { id: 'z2', title: '에스글리토 선호 고객', name: '이학술 교수', description: '', difficulty: '고급', personaImage: '/images/doctor_academic_1785238840727.png', hashtags: ['#스위칭연구', '#혈당강하 효과', '#작은 약제크기'], missionMsg: '에스글리토 선호 고객에게 제미다파의 임상 데이터를 설명하고, 처방을 유도해내세요!' },
    { id: 'z3', title: '타 MET/DPP-4i 복합제 선호 고객', name: '박보수 원장', description: '', difficulty: '초급', personaImage: '/images/doctor_z3_1785320142217.png', hashtags: ['#스위칭연구', '#혈당강하 효과', '#작은 약제크기'], missionMsg: '타 약제 선호 고객에게 제미다파 스위칭의 이점을 설명하고, 처방을 유도해내세요!' }
  ],
  vimovo: [
    { id: 'v1', title: '낙소졸 선호 고객', name: '김비모 원장', description: '', difficulty: '중급', personaImage: '/images/doctor_v1_1785320153099.png', hashtags: ['#복합제이점', '#심혈관안전성', '#오리지널'], missionMsg: '낙소졸 선호 고객에게 비모보의 이점을 설명하고, 처방을 유도해내세요!' },
    { id: 'v2', title: '쎄레브렉스 선호 고객', name: '최안전 교수', description: '', difficulty: '고급', personaImage: '/images/doctor_strict_male_1785317537635.png', hashtags: ['#복합제이점', '#심혈관안전성', '#오리지널'], missionMsg: '쎄레브렉스 선호 교수에게 비모보의 위장관 안전성을 설명하고, 처방을 유도해내세요!' },
    { id: 'v3', title: 'SYSADOA 선호 고객', name: '이순응 원장', description: '', difficulty: '초급', personaImage: '/images/doctor_v3_1785320175316.png', hashtags: ['#복합제이점', '#심혈관안전성', '#오리지널'], missionMsg: 'SYSADOA 선호 고객에게 비모보 1정 복합제의 이점을 설명하고, 처방을 유도해내세요!' }
  ],
  nephoxil: [
    { id: 'n1', title: '세벨라머 처방 유지 고객 (가상)', name: '한네폭 원장', description: '', difficulty: '중급', personaImage: '/images/doctor_n1_1785320185475.png', hashtags: ['#변비부작용완화'], missionMsg: '세벨라머 처방 유지 고객에게 네폭실의 차별화된 인결합 능력을 설명하고, 처방을 유도해내세요!' }
  ]
};
const PRODUCT_CHECKLIST: Record<string, { key: string; label: string; regex: RegExp }[]> = {
  zemidapa: [
    { key: 'switchingStudy', label: 'SWITCHING 연구 디자인을 소개하세요.', regex: /switching|스위칭|교체|switch/i },
    { key: 'hba1c', label: '각 군별 HbA1c 감소 효과를 자세히 언급하세요.', regex: /hba1c|혈당|강하|당화혈색소/i },
    { key: 'safety', label: '각 군별 안전성 결과도 언급하세요.', regex: /안전|저혈당|부작용|내약성/i },
    { key: 'tabletSize', label: '타 경쟁품 대비 작은 알약 크기 강조하세요.', regex: /크기|목넘김|시다프비아|순응도|작은|알약/i },
    { key: 'closing', label: '클로징으로 제미다파 처방을 유도하세요.', regex: /처방|추천|권유|사용|적용/i },
  ],
  vimovo: [
    { key: 'coating', label: '5중 코팅 기전의 특장점을 상세히 설명하세요.', regex: /코팅|속방|장용|에스오메프라졸|방출/i },
    { key: 'ulcerData', label: 'PN400 연구 기반 위궤양 예방 데이터를 언급하세요.', regex: /위궤양|4\.1|23\.1|PN400|위장관/i },
    { key: 'compliance', label: '1정 복합제로 인한 환자 복약 순응도 개선을 강조하세요.', regex: /1정|복합|ppi|편의|순응도/i },
    { key: 'safety', label: '장기 복용 시의 심혈관 및 위장관 안전성을 설명하세요.', regex: /안전|부작용|심혈관|위장/i },
    { key: 'closing', label: '클로징으로 비모보 처방을 적극 유도하세요.', regex: /처방|추천|권유|사용|적용/i },
  ],
  nephoxil: [
    { key: 'phosphate', label: '비칼슘계 인결합제로서의 인 감소 효과를 설명하세요.', regex: /인결합|인산|phosphate|인 감소|비칼슘/i },
    { key: 'iron', label: '철분 보충 효과로 인한 ESA 주사제 절감 이점을 언급하세요.', regex: /철분|iron|ferric|esa|주사제|보충/i },
    { key: 'kdigo', label: 'KDIGO 가이드라인에 기반한 네폭실의 적합성을 강조하세요.', regex: /kdigo|가이드라인|빈혈|모니터링/i },
    { key: 'competitor', label: '세벨라머 등 타 경쟁품 대비 차별점을 논리적으로 제시하세요.', regex: /세벨라머|칼슘계|석회화|경쟁/i },
    { key: 'closing', label: '클로징으로 네폭실 처방을 적극 유도하세요.', regex: /처방|추천|권유|사용|적용/i },
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

type AppScreen = 'login' | 'productSelect' | 'scenarioSelect' | 'roleplay' | 'evaluation';
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
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  // Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('lg_roleplay_sessions', JSON.stringify(savedSessions));
  }, [savedSessions]);

  // ── Derived ──
  const selectedProduct = PRODUCTS[selectedProductId] || null;
  const scenarios = SCENARIOS[selectedProductId] || [];
  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || null;
  const checklistItems = PRODUCT_CHECKLIST[selectedProductId] || [];

  // ── Handlers ──
  const handleLogin = (info: EmployeeInfo) => {
    setEmployeeInfo(info);
    setScreen('productSelect');
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setScreen('scenarioSelect');
  };

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    
    // Reset chat
    setChatHistory([]);
    setEvaluation(null);

    // Initialize checklist
    const initialChecklist: Record<string, boolean> = {};
    (PRODUCT_CHECKLIST[selectedProductId] || []).forEach(item => { initialChecklist[item.key] = false; });
    setChecklistStatus(initialChecklist);

    setScreen('roleplay');
  };

  const handleEndRoleplay = useCallback(async (conversationId?: string) => {
    setIsEvaluating(true);
    setScreen('evaluation');

    try {
      const historyForApi = chatHistory.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          scenarioTitle: selectedScenario?.title || selectedScenarioId,
          chatHistory: historyForApi,
          conversationId,
        }),
      });

      const data = await res.json();
      const evalResult: RoleplayEvaluationResult = {
        ...data,
        isSuccess: data.isSuccess ?? false,
        reasoning: data.reasoning ?? (data.isSuccess ? '선생님의 처방변경 이유: 설득력 있는 어필이었습니다.' : '선생님의 Unmet needs: 전달력이 부족했습니다.')
      };

      setEvaluation(evalResult);

      const newSession: SavedSession = {
        id: generateId(),
        date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        productId: selectedProductId,
        productName: selectedProduct?.name || '',
        specialtyName: '',
        doctorTypeName: selectedScenario?.title || '',
        evaluation: evalResult,
        chatHistory,
      };
      setSavedSessions(prev => [newSession, ...prev]);
    } catch (err) {
      console.error('Evaluation error:', err);
      const evalResult: RoleplayEvaluationResult = {
        isSuccess: false,
        reasoning: '선생님의 Unmet needs: 평가 중 오류가 발생했습니다. 좀 더 명확한 데이터 어필이 필요합니다.',
      };
      setEvaluation(evalResult);
      
      const newSession: SavedSession = {
        id: generateId(),
        date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        productId: selectedProductId,
        productName: selectedProduct?.name || '',
        specialtyName: '',
        doctorTypeName: selectedScenario?.title || '',
        evaluation: evalResult,
        chatHistory,
      };
      setSavedSessions(prev => [newSession, ...prev]);
    } finally {
      setIsEvaluating(false);
    }
  }, [chatHistory, selectedProductId, selectedScenarioId, selectedProduct, selectedScenario]);

  const handleRetry = () => {
    handleSelectScenario(selectedScenarioId);
  };

  const handleNewProduct = () => {
    setScreen('productSelect');
    setSelectedProductId('');
    setSelectedScenarioId('');
    setChatHistory([]);
    setEvaluation(null);
  };

  const handleLogout = () => {
    setEmployeeInfo(null);
    setSelectedProductId('');
    setSelectedScenarioId('');
    setChatHistory([]);
    setEvaluation(null);
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
      case 'scenarioSelect':
        return selectedProduct ? (
          <ScenarioSelectScreen
            product={selectedProduct}
            scenarios={scenarios}
            onSelectScenario={handleSelectScenario}
            onBack={() => setScreen('productSelect')}
          />
        ) : null;
      case 'roleplay':
        return selectedProduct && selectedScenario ? (
          <ConversationProvider>
            <FlashDoctorRoom
              product={selectedProduct}
              scenario={selectedScenario}
              employeeInfo={employeeInfo!}
              checklistStatus={checklistStatus}
              setChecklistStatus={setChecklistStatus}
              checklistItems={checklistItems.map(i => ({ key: i.key, label: i.label, regex: i.regex }))}
              onEndRoleplay={handleEndRoleplay}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              onBack={() => {
                setSelectedProductId('');
                setSelectedScenarioId('');
                setChatHistory([]);
                setChecklistStatus({});
                setScreen('productSelect');
              }}
            />
          </ConversationProvider>
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
        return evaluation && selectedProduct && selectedScenario ? (
          <EvaluationReport
            evaluation={evaluation}
            product={selectedProduct}
            onRetry={handleRetry}
            onClose={handleNewProduct}
            chatHistory={chatHistory}
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
    </div>
  );
}