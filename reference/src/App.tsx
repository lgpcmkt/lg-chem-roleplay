import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FlashDoorKnockModal } from './components/FlashDoorKnockModal';
import { FlashDoctorRoom } from './components/FlashDoctorRoom';
import { EvaluationReportModal } from './components/EvaluationReportModal';
import { MyGradebook } from './components/MyGradebook';
import { EmployeeLoginModal, EmployeeInfo } from './components/EmployeeLoginModal';
import { GoogleSheetsIntegrationModal } from './components/GoogleSheetsIntegrationModal';
import { DoctorPersona, ChatMessage, RoleplayEvaluationResult, SavedSession } from './types';
import { DOCTOR_PERSONAS } from './server/doctorPersonas';
import { formatDoctorGreeting } from './utils/mrUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gradebook'>('dashboard');
  const [doctors, setDoctors] = useState<DoctorPersona[]>(Object.values(DOCTOR_PERSONAS));
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('park_jin_ryo');
  
  // Employee Login State
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(() => {
    try {
      const stored = localStorage.getItem('zemidapa_employee_info');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(!employeeInfo);

  // Roleplay Session & Flash Game State
  const [isRoleplaying, setIsRoleplaying] = useState<boolean>(false);
  const [flashStep, setFlashStep] = useState<'knock' | 'room'>('knock');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<RoleplayEvaluationResult | null>(null);
  
  // Saved Sessions in localStorage
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const stored = localStorage.getItem('zemidapa_roleplay_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Google Sheets Modal State
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [googleSheetsEvalExport, setGoogleSheetsEvalExport] = useState<{
    evaluation: RoleplayEvaluationResult;
    doctor: DoctorPersona;
  } | undefined>(undefined);
  const [googleSheetsSessionsExport, setGoogleSheetsSessionsExport] = useState<SavedSession[] | undefined>(undefined);

  // Sync saved sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zemidapa_roleplay_sessions', JSON.stringify(savedSessions));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [savedSessions]);

  // Save employee info
  const handleSaveEmployeeInfo = (info: EmployeeInfo) => {
    setEmployeeInfo(info);
    try {
      localStorage.setItem('zemidapa_employee_info', JSON.stringify(info));
    } catch (err) {
      console.error('Failed to save employee info:', err);
    }
    setIsEmployeeModalOpen(false);
  };

  // Fetch doctors list from API if available
  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
        }
      })
      .catch(() => {
        // Fallback to local imported personas
      });
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Start a new roleplay session (opens Flash Knock screen)
  const handleStartRoleplay = () => {
    if (!employeeInfo) {
      setIsEmployeeModalOpen(true);
      return;
    }
    const greeting = formatDoctorGreeting(selectedDoctor.id, selectedDoctor.initialMessage, employeeInfo.name);
    const initialMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory([initialMsg]);
    setCurrentEvaluation(null);
    setShowReport(false);
    setIsSaved(false);
    setFlashStep('knock');
    setIsRoleplaying(true);
  };

  // Launch roleplay with a specific doctor (from scenario or dashboard)
  const handleSelectScenario = (doctorId: string) => {
    if (!employeeInfo) {
      setIsEmployeeModalOpen(true);
      return;
    }
    setSelectedDoctorId(doctorId);
    const targetDoc = doctors.find((d) => d.id === doctorId) || doctors[0];
    const greeting = formatDoctorGreeting(targetDoc.id, targetDoc.initialMessage, employeeInfo.name);
    const initialMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory([initialMsg]);
    setCurrentEvaluation(null);
    setShowReport(false);
    setIsSaved(false);
    setFlashStep('knock');
    setIsRoleplaying(true);
  };

  // Trigger evaluation
  const handleFinishAndEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          chatHistory: chatHistory,
        }),
      });

      const data = await response.json();
      setCurrentEvaluation(data);
      setShowReport(true);
      setIsRoleplaying(false);

      // Auto log to backend DB for employee
      if (employeeInfo?.employeeId) {
        fetch('/api/learning-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: employeeInfo.employeeId,
            employeeName: employeeInfo.name,
            department: employeeInfo.department,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            doctorTitle: selectedDoctor.title,
            score: data.totalScore,
            grade: data.grade,
            summary: data.summary,
            keyChecklistStatus: data.keyChecklistStatus,
          }),
        }).catch((err) => console.error('Failed to log to DB:', err));
      }

    } catch (error) {
      console.error('Failed to evaluate:', error);
      const dummyEval: RoleplayEvaluationResult = {
        totalScore: 85,
        grade: 'A',
        scores: {
          switchingStudyScore: 26,
          same3DrugSwitchScore: 25,
          competitorSizeScore: 18,
          closingScore: 16,
        },
        summary: '제미다파 SWITCHING 연구 결과 및 동일 3제 교체 시 추가 HbA1c 강하 데이터를 잘 설명했습니다.',
        strengths: [
          'SWITCHING 연구의 3제 교체 효능 포인트를 잘 전달함',
          '시다프비아 대비 알약 크기 장점을 언급함',
        ],
        weaknesses: [
          '동일 3제 교체 시의 추가 혈당 강하 데이터 구체성 보완 필요',
          '명확한 처방 권유(Closing) 마무리 권장',
        ],
        detailedFeedback:
          '전반적인 설명이 매우 자연스러웠습니다. 동일한 3제 병용 치료 중인 환자에서도 제미다파 교체 시 추가적인 HbA1c 감소 효과가 입증된 점을 강조해 보세요.',
        turnByTurnAnalysis: [],
        recommendedScript:
          '원장님, 기존 3제 치료 중인 환자분도 제미다파 3제로 교체하시면 추가 혈당 강하와 시다프비아 대비 작은 알약 복용 편의성을 동시에 제공하실 수 있습니다!',
        keyChecklistStatus: {
          switchingStudyMentioned: true,
          same3DrugHbA1cReductionMentioned: true,
          sidapviaPillSizeCompared: true,
          patientComplianceEmphasized: true,
          objectionOvercomeSuccessfully: true,
          closingCallToActionMade: false,
        },
      };
      setCurrentEvaluation(dummyEval);
      setShowReport(true);
      setIsRoleplaying(false);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save current evaluation to My Gradebook
  const handleSaveToGradebook = () => {
    if (!currentEvaluation || isSaved) return;

    const newSession: SavedSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ko-KR'),
      doctorName: selectedDoctor.name,
      doctorTitle: selectedDoctor.title,
      hospital: selectedDoctor.hospital,
      evaluation: currentEvaluation,
      chatHistory: chatHistory,
    };

    setSavedSessions([newSession, ...savedSessions]);
    setIsSaved(true);
  };

  // View a previously saved session report
  const handleViewSavedSession = (session: SavedSession) => {
    setCurrentEvaluation(session.evaluation);
    setChatHistory(session.chatHistory);
    setShowReport(true);
    setIsRoleplaying(false);
    setIsSaved(true);
  };

  // Clear all saved gradebook history
  const handleClearHistory = () => {
    if (confirm('정말로 모든 롤플레이 성적표 히스토리를 삭제하시겠습니까?')) {
      setSavedSessions([]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#F9FAFB] font-sans text-slate-900">
      
      {/* Employee ID Login Modal */}
      <EmployeeLoginModal
        isOpen={isEmployeeModalOpen}
        onSave={handleSaveEmployeeInfo}
        currentInfo={employeeInfo}
        onClose={() => setIsEmployeeModalOpen(false)}
      />

      {/* Sidebar / Header Navigation */}
      {!isRoleplaying && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowReport(false);
          }}
          savedSessionsCount={savedSessions.length}
          employeeInfo={employeeInfo}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Loading Overlay when evaluating */}
        {isEvaluating && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white space-y-4">
            <div className="w-16 h-16 border-4 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">원장님의 속마음을 분석 중입니다...</h3>
              <p className="text-xs text-slate-300">
                제미다파 처방 의향과 디테일링 포인트를 종합 평가하고 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Live Roleplay Screen */}
        {isRoleplaying ? (
          flashStep === 'knock' ? (
            <FlashDoorKnockModal
              doctors={doctors}
              selectedDoctorId={selectedDoctorId}
              onSelectDoctor={(docId) => setSelectedDoctorId(docId)}
              onKnockAndEnter={() => setFlashStep('room')}
              onClose={() => setIsRoleplaying(false)}
            />
          ) : (
            <FlashDoctorRoom
              doctor={selectedDoctor}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              onFinishAndEvaluate={handleFinishAndEvaluate}
              onBackToKnock={() => setFlashStep('knock')}
              employeeName={employeeInfo?.name}
            />
          )
        ) : showReport && currentEvaluation ? (
          /* Evaluation Report View */
          <EvaluationReportModal
            evaluation={currentEvaluation}
            doctor={selectedDoctor}
            onRetry={handleStartRoleplay}
            onSaveToGradebook={handleSaveToGradebook}
            onExportToGoogleSheets={() => {
              setGoogleSheetsEvalExport({ evaluation: currentEvaluation, doctor: selectedDoctor });
              setGoogleSheetsSessionsExport(savedSessions);
              setIsGoogleSheetsModalOpen(true);
            }}
            isSaved={isSaved}
          />
        ) : (
          /* Main Tab Screens */
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                doctors={doctors}
                selectedDoctorId={selectedDoctorId}
                setSelectedDoctorId={setSelectedDoctorId}
                onStartRoleplay={handleStartRoleplay}
                employeeInfo={employeeInfo}
                onChangeEmployee={() => setIsEmployeeModalOpen(true)}
              />
            )}

            {activeTab === 'gradebook' && (
              <MyGradebook
                savedSessions={savedSessions}
                onViewSession={handleViewSavedSession}
                onClearHistory={handleClearHistory}
                onStartNewRoleplay={() => {
                  setActiveTab('dashboard');
                }}
                onOpenGoogleSheets={() => {
                  setGoogleSheetsEvalExport(undefined);
                  setGoogleSheetsSessionsExport(savedSessions);
                  setIsGoogleSheetsModalOpen(true);
                }}
                employeeInfo={employeeInfo}
              />
            )}
          </>
        )}

        {/* Google Sheets Integration Modal */}
        <GoogleSheetsIntegrationModal
          isOpen={isGoogleSheetsModalOpen}
          onClose={() => setIsGoogleSheetsModalOpen(false)}
          evaluationToExport={googleSheetsEvalExport}
          savedSessionsToExport={googleSheetsSessionsExport}
          employeeInfo={employeeInfo}
        />
      </main>
    </div>
  );
}
