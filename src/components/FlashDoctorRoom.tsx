/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Scenario, EmployeeInfo, ChatMessage } from '../types';
import { ArrowLeft, Mic, Phone, AlertCircle, Send, MessageSquare, X } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';

interface FlashDoctorRoomProps {
  product: Product;
  scenario: Scenario;
  employeeInfo: EmployeeInfo;
  checklistStatus: Record<string, boolean>;
  setChecklistStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checklistItems: { key: string; label: string; regex: RegExp }[];
  onEndRoleplay: (conversationId?: string) => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onBack: () => void;
  persona: string;
}

const AGENT_ID = 'agent_6501kymkvp51eb68k1m589abc18s';

export const FlashDoctorRoom: React.FC<FlashDoctorRoomProps> = ({
  product, scenario, employeeInfo, checklistStatus, setChecklistStatus, checklistItems,
  onEndRoleplay, chatHistory, setChatHistory, onBack, persona
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Use refs for callbacks to avoid stale closure issues
  const setChatHistoryRef = useRef(setChatHistory);
  const setChecklistStatusRef = useRef(setChecklistStatus);
  const checklistItemsRef = useRef(checklistItems);
  setChatHistoryRef.current = setChatHistory;
  setChecklistStatusRef.current = setChecklistStatus;
  checklistItemsRef.current = checklistItems;

  const conversation = useConversation({
    onMessage: (message) => {
      console.log('[ElevenLabs onMessage]', message);
      const role = message.source === 'user' ? 'user' as const : 'assistant' as const;
      const text = message.message;
      const cleanText = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();

      setChatHistoryRef.current(prev => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content: cleanText,
        timestamp: new Date().toISOString()
      }]);

      // Update checklist for user messages
      if (message.source === 'user') {
        setChecklistStatusRef.current(prev => {
          const updated = { ...prev };
          checklistItemsRef.current.forEach(item => {
            if (!updated[item.key] && item.regex.test(text)) {
              updated[item.key] = true;
            }
          });
          return updated;
        });
      }
    },
    onError: (error) => {
      console.error('[ElevenLabs Error]', error);
    },
    onStatusChange: (status) => {
      console.log('[ElevenLabs Status]', status);
    },
    onConnect: (props) => {
      console.log('[ElevenLabs Connected]', props.conversationId);
    },
    onDisconnect: (details) => {
      console.log('[ElevenLabs Disconnected]', details);
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

  // Mic Volume Polling for visualizer
  useEffect(() => {
    let animationFrameId: number;
    const pollVolume = () => {
      if (conversation.status === 'connected') {
        try {
          const volume = conversation.getInputVolume();
          setMicVolume(volume || 0);
        } catch {
          setMicVolume(0);
        }
        animationFrameId = requestAnimationFrame(pollVolume);
      }
    };
    if (conversation.status === 'connected') {
      pollVolume();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [conversation.status, conversation]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (conversation.status === 'connected') {
      // The SDK uses setMuted or setVolume for microphone mute
      // Wait, let's just avoid calling it if it doesn't exist, or call setMuted if it exists.
      if ('setMuted' in conversation) {
        (conversation as any).setMuted(nextMuted);
      }
    }
  }, [isMuted, conversation]);

  const handleStartCall = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMuted(false);

      await conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          product_name: product.name,
          product_name_en: product.nameEn,
          product_composition: product.composition,
          product_indication: product.indication,
          scenario_title: scenario.title,
          doctor_name: scenario.name,
          doctor_persona: persona,
          user_name: employeeInfo.name,
          company: 'LG화학',
        },
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('마이크 접근을 허용하거나 에이전트 설정(AGENT_ID)을 확인해주세요.');
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, product.name, scenario.title, employeeInfo.name, scenario.personaImage]);

  const handleEndCall = useCallback(async () => {
    const cid = conversation.getId();
    await conversation.endSession();
    onEndRoleplay(cid);
  }, [conversation, onEndRoleplay]);

  const handleSendText = useCallback(() => {
    const msg = textInput.trim();
    if (!msg || conversation.status !== 'connected') return;
    conversation.sendUserMessage(msg);
    setTextInput('');
  }, [conversation, textInput]);

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

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
            ) : isConnecting ? (
              <span className="text-xs font-bold text-white/70">CONNECTING...</span>
            ) : (
              <span className="text-xs font-bold text-white/70">READY</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Video/Avatar Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={scenario.personaImage || '/images/doctor_z1_1785320119267.png'} 
          alt={scenario.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
      </div>

      {/* Loading Overlay when isConnecting */}
      {isConnecting && conversation.status !== 'connected' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
          <img src={scenario.personaImage || '/images/doctor_z1_1785320119267.png'} className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110 blur-xl" alt="blur-bg" />
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="z-10 flex flex-col items-center gap-6 animate-fadeIn">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">진료실 문을 열고 들어가는 중입니다...</h2>
              <p className="text-blue-200 text-sm md:text-base font-medium">잠시만 기다려주세요. 곧 {scenario.name} 원장님과의 롤플레이가 시작됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Panel */}
      {showChat && conversation.status === 'connected' && (
        <div className="absolute right-4 top-20 bottom-40 w-80 md:w-96 z-30 flex flex-col bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">💬 대화 기록</h3>
            <button onClick={() => setShowChat(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white/15 text-white/90 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Text Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleTextKeyDown}
                placeholder="텍스트로 입력..."
                className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
              />
              <button 
                onClick={handleSendText} 
                disabled={!textInput.trim()}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating UI Elements */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-20 flex flex-col md:flex-row gap-6 items-end justify-between">
        
        {/* Left: Persona Info & Subtitles */}
        <div className="flex-1 max-w-2xl w-full">
          {/* Active Speaking Indicator */}
          <div className={`transition-opacity duration-300 ${conversation.status === 'connected' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-3 mb-4 bg-black/40 backdrop-blur-sm w-fit px-5 py-2.5 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <div className="flex gap-1.5">
                <span className={`w-2 h-2 rounded-full ${conversation.isSpeaking ? 'bg-green-400 animate-bounce' : 'bg-white/50 animate-pulse'}`} style={{ animationDelay: '0ms' }} />
                <span className={`w-2 h-2 rounded-full ${conversation.isSpeaking ? 'bg-green-400 animate-bounce' : 'bg-white/50 animate-pulse'}`} style={{ animationDelay: '150ms' }} />
                <span className={`w-2 h-2 rounded-full ${conversation.isSpeaking ? 'bg-green-400 animate-bounce' : 'bg-white/50 animate-pulse'}`} style={{ animationDelay: '300ms' }} />
              </div>
              <span className={`text-base md:text-lg font-bold tracking-wide ${conversation.isSpeaking ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'text-white/90'}`}>
                {conversation.isSpeaking ? '🗣️ 원장님이 말씀 중입니다...' : '🤔 원장님이 듣고 생각 중입니다...'}
              </span>
            </div>
          </div>

          {/* Latest agent message as subtitle */}
          {conversation.message && (
            <div className="mb-4 bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 max-w-lg">
              <p className="text-white text-sm leading-relaxed">{conversation.message}</p>
            </div>
          )}

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
              <AlertCircle className="w-4 h-4" /> 핵심 키워드를 활용해 보세요!
            </h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              "{scenario.missionMsg}"
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10 relative">
            {conversation.status === 'connected' ? (
              <>
                {/* Active Mic Indicator with Ripple */}
                <div className="relative flex items-center justify-center w-14 h-14">
                  <div 
                    className="absolute inset-0 bg-emerald-500 rounded-full opacity-40 transition-transform duration-75 will-change-transform"
                    style={{ transform: `scale(${1 + micVolume * 2.5})` }} 
                  />
                  <div className="relative z-10 w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-emerald-400" style={{ transform: 'translateZ(0)' }}>
                    <Mic className="w-5 h-5" />
                  </div>
                </div>

                {/* Chat Toggle */}
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    showChat 
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* End Call */}
                <button 
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                </button>
              </>
            ) : isConnecting ? (
              <div className="w-16 h-16 rounded-full bg-blue-500/50 flex items-center justify-center text-white shadow-lg cursor-not-allowed">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button 
                onClick={handleStartCall}
                disabled={isConnecting}
                className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}
            
            <p className="text-xs text-white/60 font-medium absolute -bottom-6 whitespace-nowrap">
              {conversation.status === 'connected' ? '통화 종료' : isConnecting ? '연결 중 (약 3초 소요)...' : '음성 롤플레이 시작'}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
