import React, { useState, useCallback, useEffect } from 'react';
import { EmployeeInfo, ChatMessage, RoleplayEvaluationResult, UserProgress, Scenario } from './types';
import { EmployeeLoginModal } from './components/EmployeeLoginModal';
import { HomeScreen } from './components/HomeScreen';
import { RoleplayRoom } from './components/RoleplayRoom';
import { EvaluationReport } from './components/EvaluationReport';
import { ScenarioSelectScreen } from './components/ScenarioSelectScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ConversationProvider } from '@elevenlabs/react';
import { SCENARIOS } from './data';

type AppScreen = 'login' | 'home' | 'scenario' | 'roleplay' | 'evaluation' | 'history';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<'zemiglo' | 'zemimet' | 'zemidapa'>('zemiglo');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  
  const [evaluation, setEvaluation] = useState<RoleplayEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Auto-login check
  useEffect(() => {
    const stored = localStorage.getItem('lg_roleplay_user');
    if (stored) {
      setEmployeeInfo(JSON.parse(stored));
      setScreen('home');
    }
  }, []);

  const handleLogin = async (info: EmployeeInfo) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: info.employeeId, name: info.name })
      });
      if (res.ok) {
        setEmployeeInfo(info);
        localStorage.setItem('lg_roleplay_user', JSON.stringify(info));
        setScreen('home');
      }
    } catch (e) {
      console.error('Login failed', e);
      alert('로그인에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lg_roleplay_user');
    setEmployeeInfo(null);
    setScreen('login');
  };

  const handleSelectProduct = async (product: 'zemiglo' | 'zemimet' | 'zemidapa') => {
    setSelectedProduct(product);
    setScreen('scenario');
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    setScreen('roleplay');
  };

  const handleEndRoleplay = useCallback(async (chatHistory: ChatMessage[], conversationId?: string) => {
    if (!currentScenario || !employeeInfo) return;
    
    setIsEvaluating(true);
    setScreen('evaluation');

    try {
      let evalResult;
      
      // Try ElevenLabs evaluation if conversationId exists
      if (conversationId) {
        try {
          const res = await fetch(`/api/elevenlabs/evaluation/${conversationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatHistory, scenario: currentScenario })
          });
          if (res.ok) {
            evalResult = await res.json();
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.details || `Server responded with ${res.status}`);
          }
        } catch (e: any) {
          console.error("ElevenLabs evaluation failed:", e);
          evalResult = {
            isSuccess: false,
            grade: 'C',
            totalScore: 0,
            reasoning: `평가 서버 연동 중 오류가 발생했습니다. 상세 원인: [${e.message}]`,
            strengths: [],
            weaknesses: [],
            recommendedScript: '',
            detailedFeedback: 'API 에러'
          };
        }
      }

      if (!evalResult) {
        evalResult = {
          isSuccess: false,
          grade: 'C',
          totalScore: 0,
          reasoning: '평가 처리 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          strengths: [],
          weaknesses: [],
          recommendedScript: '',
          detailedFeedback: '알 수 없는 오류'
        };
      }
      
      setEvaluation(evalResult);

      // Save to backend
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          userId: employeeInfo.employeeId,
          track: currentScenario.product, // keeping track field for backward compatibility or change to product later
          scenarioId: currentScenario.id,
          grade: evalResult.grade,
          evaluation_data: evalResult
        })
      });

    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluation({
        isSuccess: false,
        grade: 'C',
        reasoning: '평가 처리 중 오류가 발생했습니다.',
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [currentScenario, employeeInfo]);

  if (screen === 'login') {
    return <EmployeeLoginModal isOpen={true} onSave={handleLogin} currentInfo={employeeInfo} />;
  }

  return (
    <div className="h-[100dvh] bg-slate-200 flex items-center justify-center font-sans overflow-hidden">
      <main className="max-w-md w-full h-[100dvh] bg-slate-50 shadow-2xl relative overflow-hidden flex flex-col text-slate-800">
        {screen === 'home' && employeeInfo && (
          <HomeScreen 
            employeeInfo={employeeInfo} 
            onLogout={handleLogout} 
            onSelectProduct={handleSelectProduct} 
            onShowHistory={() => setScreen('history')}
          />
        )}
        {screen === 'history' && employeeInfo && (
          <HistoryScreen
            employeeInfo={employeeInfo}
            onBack={() => setScreen('home')}
            onSelectRecord={(evalData) => {
              setEvaluation(evalData);
              setScreen('evaluation');
            }}
          />
        )}
        {screen === 'scenario' && employeeInfo && (
          <ScenarioSelectScreen 
            employeeInfo={employeeInfo}
            product={selectedProduct}
            onSelect={handleSelectScenario}
            onBack={() => setScreen('home')}
            onHome={() => setScreen('home')}
          />
        )}
        
        {screen === 'roleplay' && currentScenario && employeeInfo && (
          <ConversationProvider>
            <RoleplayRoom 
              scenario={currentScenario} 
              employeeInfo={employeeInfo} 
              onEndRoleplay={handleEndRoleplay} 
              onBack={() => setScreen('scenario')} 
              onHome={() => setScreen('home')}
            />
          </ConversationProvider>
        )}

        {screen === 'evaluation' && (
          isEvaluating ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 w-full">
              <div className="p-8 flex flex-col items-center text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <div className="font-bold text-lg text-slate-600">고객의 속마음을 분석 중입니다...</div>
              </div>
            </div>
          ) : evaluation && (
            <EvaluationReport 
              evaluation={evaluation} 
              onRetry={() => setScreen('roleplay')} 
              onClose={() => setScreen('home')} 
            />
          )
        )}
      </main>
    </div>
  );
}