import React, { useState, useEffect, useRef } from 'react';
import { DoctorPersona, ChatMessage } from '../types';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface RoleplayChatProps {
  doctor: DoctorPersona;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onFinishAndEvaluate: () => void;
  onBackToDashboard: () => void;
}

export const RoleplayChat: React.FC<RoleplayChatProps> = ({
  doctor,
  chatHistory,
  setChatHistory,
  onFinishAndEvaluate,
  onBackToDashboard,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showAiHint, setShowAiHint] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'ko-KR';

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. 키보드로 입력해 주세요.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Text-to-Speech playback for Doctor
  const speakDoctorText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 0.9; // slightly deeper male tone

      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Send message to Doctor AI
  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/doctor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          chatHistory: newHistory,
          userMessage: message,
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const doctorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedHistory = [...newHistory, doctorMsg];
        setChatHistory(updatedHistory);

        // Auto read doctor text
        speakDoctorText(data.reply);

        if (data.isFinalTurn) {
          // Wrap up message notice
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '음, 말씀하신 내용은 알겠습니다. 하지만 HbA1c 강하 데이터와 신장 보호 지표를 조금 더 논리적으로 제시해 주세요.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Turn Count (User turns)
  const turnCount = chatHistory.filter((m) => m.role === 'user').length;

  // Real-time keyword checklist evaluation
  const fullText = chatHistory.map((m) => m.content).join(' ');
  const checklist = {
    synergy: /기전|dpp|sglt|이중|병용|시너지/i.test(fullText),
    hba1c: /hba1c|혈당|강하|-1\.|당화혈색소/i.test(fullText),
    renal: /신장|egfr|uacr|알부민|보호/i.test(fullText),
    compliance: /순응도|1정|1알|복약|편의/i.test(fullText),
    closing: /처방|리플릿|샘플|약속|처방권유|디테일/i.test(fullText),
  };

  // Quick Pitch Recommendation Pills
  const pitchPills = [
    '제미글립틴과 다파글리플로진의 이중 기전으로 식후/공복 혈당을 모두 잡습니다.',
    'HbA1c 추가 -1.5% 강력한 강하 효과와 목표 혈당 도달률을 제공합니다.',
    '1일 1회 1정으로 알약 수를 줄여 복약 순응도를 20% 향상시킵니다.',
    'Dapagliflozin의 eGFR 보존 및 UACR 감소 효과로 신장을 우수하게 보호합니다.',
    '원장님, 다음 방문 시 제미다파 처방 사례 리플릿을 함께 지참해 드리겠습니다.',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Navigation & Status Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-2xl p-1.5 bg-slate-100 rounded-lg border border-slate-200">
              {doctor.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm md:text-base">
                  {doctor.name} {doctor.title}
                </h2>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {doctor.hospital}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                성향: {doctor.personality}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Turn Indicator */}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>진행 턴: {turnCount} / 7</span>
          </div>

          <button
            onClick={onFinishAndEvaluate}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Award className="w-4 h-4" />
            <span>대화 종료 및 리포트 채점</span>
          </button>
        </div>
      </div>

      {/* Realtime Mission Checklist Bar */}
      <div className="bg-slate-900 text-slate-200 px-6 py-2.5 text-xs border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2 shrink-0 font-semibold text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>실시간 미션 체크리스트:</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0">
          <div className={`flex items-center gap-1 ${checklist.synergy ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>이중기전 시너지</span>
          </div>
          <div className={`flex items-center gap-1 ${checklist.hba1c ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HbA1c 강하</span>
          </div>
          <div className={`flex items-center gap-1 ${checklist.renal ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>신장 보호</span>
          </div>
          <div className={`flex items-center gap-1 ${checklist.compliance ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1정 복약순응도</span>
          </div>
          <div className={`flex items-center gap-1 ${checklist.closing ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>클로징/처방유도</span>
          </div>
        </div>
      </div>

      {/* Main Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Mission Objective Callout */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">롤플레이 핵심 목표: </span>
              {doctor.name} {doctor.title}의 반박을 극복하고, 제미글립틴+다파글리플로진 복합제 제미다파의 1일 1회 복용 편의성과 강력한 혈당/신장 보호 효과를 전달하세요. (6~7턴 후 자동 마감)
            </div>
          </div>

          {chatHistory.map((msg) => {
            const isDoctor = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isDoctor ? 'justify-start' : 'justify-end'}`}
              >
                {isDoctor && (
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {doctor.avatar}
                  </div>
                )}

                <div className={`space-y-1 max-w-xl ${isDoctor ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-slate-700">
                      {isDoctor ? `${doctor.name} ${doctor.title}` : '나 (제미다파 MR)'}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                    {isDoctor && (
                      <button
                        onClick={() => speakDoctorText(msg.content)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                        title="음성 다시 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isDoctor
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none font-normal'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm animate-pulse">
                {doctor.avatar}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>{doctor.name} {doctor.title}이 답변을 생각 중입니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input & Pitch Helper */}
      <div className="bg-white border-t border-slate-200 p-4 space-y-3 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* AI Detailing Hint Bar Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAiHint(!showAiHint)}
              className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5 hover:text-indigo-800 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>추천 디테일링 대사 (클릭하여 입력)</span>
              {showAiHint ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-slate-400">
              💡 Tip: 마이크 버튼을 눌러 말하거나 아래 추천 대사를 클릭하세요.
            </span>
          </div>

          {/* Quick Suggestion Pills */}
          {showAiHint && (
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              {pitchPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(pill)}
                  className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-all text-left truncate max-w-full font-medium"
                >
                  "{pill}"
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
              }`}
              title={isRecording ? '음성 녹음 중지' : '음성으로 말하기'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                isRecording
                  ? '음성을 듣고 있습니다... 말씀하세요.'
                  : '제미다파 영업 메시지를 입력하세요... (Enter 키로 전송)'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>전송</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
