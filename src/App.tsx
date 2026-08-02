import React, { useState, useCallback, useEffect } from 'react';
import { EmployeeInfo, ChatMessage, RoleplayEvaluationResult, UserProgress, Scenario } from './types';
import { EmployeeLoginModal } from './components/EmployeeLoginModal';
import { HomeScreen } from './components/HomeScreen';
import { RoleplayRoom } from './components/RoleplayRoom';
import { EvaluationReport } from './components/EvaluationReport';
import { ScenarioSelectScreen } from './components/ScenarioSelectScreen';
import { evaluateRoleplayWithGemini } from './lib/geminiEvaluation';
import { ConversationProvider } from '@elevenlabs/react';
import { SCENARIOS } from './data';

type AppScreen = 'login' | 'home' | 'scenario' | 'roleplay' | 'evaluation';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  
  const [selectedTrack, setSelectedTrack] = useState<'hospital' | 'local'>('hospital');
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

  const handleSelectTrack = async (track: 'hospital' | 'local') => {
    setSelectedTrack(track);
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
      
      // If conversationId is provided, try ElevenLabs evaluation
      if (conversationId) {
        try {
          const res = await fetch(`/api/elevenlabs/evaluation/${conversationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatHistory, scenario: currentScenario })
          });
          if (res.ok) {
            evalResult = await res.json();
          }
        } catch (e) {
          console.error("ElevenLabs evaluation failed, falling back to Gemini:", e);
        }
      }

      // Fallback to Gemini if ElevenLabs fails or conversationId is missing
      if (!evalResult) {
        evalResult = await evaluateRoleplayWithGemini(
          { name: '제미다파', indication: '당뇨복합제' } as any,
          currentScenario,
          '',
          chatHistory
        );
      }
      
      setEvaluation(evalResult);

      // Save to backend
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          userId: employeeInfo.employeeId,
          track: currentScenario.track,
          scenarioId: currentScenario.id,
          grade: evalResult.grade
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
    <div className="fixed inset-0 flex bg-gray-100 overflow-hidden justify-center font-sans">
      <main className="w-full max-w-md bg-white shadow-xl flex flex-col relative overflow-hidden">
        {screen === 'home' && employeeInfo && (
          <HomeScreen 
            employeeInfo={employeeInfo} 
            onLogout={handleLogout} 
            onSelectTrack={handleSelectTrack} 
          />
        )}
        {screen === 'scenario' && employeeInfo && (
          <ScenarioSelectScreen 
            employeeInfo={employeeInfo}
            track={selectedTrack}
            onSelect={handleSelectScenario}
            onBack={() => setScreen('home')}
          />
        )}
        
        {screen === 'roleplay' && currentScenario && employeeInfo && (
          <ConversationProvider>
            <RoleplayRoom 
              scenario={currentScenario} 
              employeeInfo={employeeInfo} 
              onEndRoleplay={handleEndRoleplay} 
              onBack={() => setScreen('scenario')} 
            />
          </ConversationProvider>
        )}

        {screen === 'evaluation' && (
          isEvaluating ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border-x-2 border-black max-w-md mx-auto w-full">
              <div className="pixel-box p-8 flex flex-col items-center text-center animate-pulse">
                <div className="font-bold text-lg">원장님의 속마음을 분석 중입니다...</div>
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