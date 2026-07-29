import React, { useState, useEffect, useCallback } from 'react';
import { Product, Scenario, EmployeeInfo, ChatMessage } from '../types';
import { ArrowLeft, Mic, MicOff, Square, Phone, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';

interface FlashDoctorRoomProps {
  product: Product;
  scenario: Scenario;
  employeeInfo: EmployeeInfo;
  checklistStatus: Record<string, boolean>;
  setChecklistStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checklistItems: { key: string; label: string; regex: RegExp }[];
  onEndRoleplay: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onBack: () => void;
}

// TODO: Replace with your actual ElevenLabs Agent ID
const AGENT_ID = 'agent_6501kymkvp51eb68k1m589abc18s';

export const FlashDoctorRoom: React.FC<FlashDoctorRoomProps> = ({
  product, scenario, employeeInfo, checklistStatus, setChecklistStatus, checklistItems,
  onEndRoleplay, chatHistory, setChatHistory, onBack
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  const conversation = useConversation({
    onMessage: (message) => {
      // Handle transcript messages from ElevenLabs
      if (message.source === 'user') {
        const text = message.message;
        
        // Update Chat History
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: text,
          timestamp: new Date().toISOString()
        }]);

        // Update Checklist
        setChecklistStatus(prev => {
          const updated = { ...prev };
          checklistItems.forEach(item => {
            if (!updated[item.key] && item.regex.test(text)) {
              updated[item.key] = true;
            }
          });
          return updated;
        });
      } else if (message.source === 'ai') {
        const text = message.message;
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString()
        }]);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs Error:', error);
      alert('오디오 세션 중 오류가 발생했습니다.');
    }
  });

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (conversation.status === 'connected') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [conversation.status]);



  const handleStartCall = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          product_name: product.name,
          persona: scenario.title,
          user_name: employeeInfo.name
        }
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('마이크 접근을 허용하거나 에이전트 설정(AGENT_ID)을 확인해주세요.');
    }
  }, [conversation, product.name, scenario.title, employeeInfo.name]);

  const handleEndCall = useCallback(async () => {
    await conversation.endSession();
    onEndRoleplay();
  }, [conversation, onEndRoleplay]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full relative overflow-hidden">
      
      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 p-4 md:p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="mt-2 text-white">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md">{product.name} 디테일링</h1>
            <p className="text-sm font-medium text-white/80 drop-shadow-md">{scenario.title}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Status Badge */}
          <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
            {conversation.status === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-widest">LIVE {formatTime(elapsedTime)}</span>
              </>
            ) : (
              <span className="text-xs font-bold text-white/70">READY</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Video/Avatar Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={scenario.personaImage || '/images/doctor_strict_1785317537635.png'} 
          alt={scenario.title} 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
      </div>

      {/* Floating UI Elements */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-20 flex flex-col md:flex-row gap-6 items-end justify-between">
        
        {/* Left: Persona Info & Subtitles */}
        <div className="flex-1 max-w-2xl w-full">
          {/* Active Speaking Indicator */}
          <div className={`transition-opacity duration-300 ${conversation.isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-white/80 font-medium">원장님이 말씀 중입니다...</span>
            </div>
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-extrabold drop-shadow-lg">{scenario.name}</h2>
            {scenario.hashtags && scenario.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {scenario.hashtags.map((tag, i) => (
                  <span key={i} className="text-sm font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full drop-shadow-md backdrop-blur-md border border-white/30">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Hint Box & Controls */}
        <div className="w-full md:w-96 flex flex-col gap-4">
          
          {/* Suggestion Box */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/20 transform transition-all hover:scale-[1.02]">
            <h4 className="text-blue-600 font-bold text-xs mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Try responding like this!
            </h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              "{scenario.missionMsg}"
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 bg-black/40 backdrop-blur-md rounded-3xl p-3 border border-white/10">
            {conversation.status === 'connected' ? (
              <>
                <button 
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleStartCall}
                className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}
            
            <p className="text-xs text-white/60 font-medium absolute -bottom-6">
              {conversation.status === 'connected' ? '통화 종료' : '음성 롤플레이 시작'}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
