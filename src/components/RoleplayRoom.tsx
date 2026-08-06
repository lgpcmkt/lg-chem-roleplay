import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scenario, EmployeeInfo, ChatMessage } from '../types';
import { ArrowLeft, Mic, Send, X, MicOff, CheckCircle } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { TypewriterText } from './TypewriterText';

interface RoleplayRoomProps {
  scenario: Scenario;
  employeeInfo: EmployeeInfo;
  onEndRoleplay: (chatHistory: ChatMessage[], conversationId?: string) => void;
  onBack: () => void;
}

const AGENT_ID = 'agent_6501kymkvp51eb68k1m589abc18s';

export const RoleplayRoom: React.FC<RoleplayRoomProps> = ({
  scenario, employeeInfo, onEndRoleplay, onBack
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMicPressed, setIsMicPressed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasAutoStarted = useRef(false);
  const recognitionRef = useRef<any>(null);
  const [interimText, setInterimText] = useState('');

  const productInfo = {
    zemiglo: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500', btn: 'btn-duo-orange' },
    zemimet: { bg: 'bg-[#78350f]', border: 'border-[#78350f]', text: 'text-[#78350f]', btn: 'btn-duo-brown' },
    zemidapa: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-500', btn: 'btn-duo-pink' }
  }[scenario.product];

  const conversation = useConversation({
    onMessage: (message: any) => {
      const role = message.source === 'user' || message.role === 'user' ? 'user' : 'assistant';

      let content = message.message;
      if (role === 'assistant') {
        content = content.replace(/\[.*?\]|\*.*?\*/g, '').trim();
      }

      setChatHistory(prev => {
        if (prev.length > 0) {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.role === role && lastMsg.content === content) {
            return prev;
          }
        }
        return [...prev, {
          id: Date.now().toString(),
          role,
          content: content,
          timestamp: new Date().toISOString()
        }];
      });
    },
    onError: (error) => console.error('[ElevenLabs Error]', error)
  });

  const isMicPressedRef = useRef(false);
  const isListeningRef = useRef(false);

  useEffect(() => {
    isMicPressedRef.current = isMicPressed;
    isListeningRef.current = isMicPressed && !conversation.isSpeaking;
  }, [isMicPressed, conversation.isSpeaking]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';
        
        recognition.onresult = (event: any) => {
          if (!isListeningRef.current) {
            setInterimText('');
            return;
          }
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentInterim += event.results[i][0].transcript;
          }
          setInterimText(currentInterim);
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Handle Speech Recognition Start/Stop
  useEffect(() => {
    if (!recognitionRef.current) return;
    const shouldListen = isMicPressed && !conversation.isSpeaking;

    if (shouldListen) {
      setInterimText('');
      try { recognitionRef.current.start(); } catch (e) {}
    } else {
      setInterimText('');
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, [isMicPressed, conversation.isSpeaking]);



  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, interimText, conversation.isSpeaking]);

  // Handle Push-to-Talk (Mute when not pressed)
  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setMuted(!isMicPressed);
    }
  }, [isMicPressed, conversation.status]);

  // Auto-enable mic on connect
  useEffect(() => {
    if (conversation.status === 'connected') {
      setIsMicPressed(true);
    }
  }, [conversation.status]);

  const handleStartCall = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          doctor_persona: scenario.title,
          mission: scenario.mission,
          first_message: scenario.firstMessage,
          recommended_detail: scenario.recommendedDetail
        },
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('연결 실패. 마이크 권한을 확인해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    if (!hasAutoStarted.current && conversation.status === 'disconnected') {
      hasAutoStarted.current = true;
      handleStartCall();
    }
  }, [conversation.status]);

  const handleEndCall = async () => {
    let convId = '';
    if (conversation.status === 'connected') {
      convId = conversation.getId();
      await conversation.endSession();
    }
    onEndRoleplay(chatHistory, convId);
  };

  const handleSendText = () => {
    const msg = textInput.trim();
    if (!msg) return;
    
    setChatHistory(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString()
    }]);

    if (conversation.status === 'connected') {
      conversation.sendUserMessage(msg);
    }
    setTextInput('');
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const calculateProgress = () => {
    // Simple mock progress based on turns (max 10 turns)
    const userTurns = chatHistory.filter(m => m.role === 'user').length;
    return Math.min((userTurns / 5) * 100, 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 font-sans min-h-screen relative overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 bg-white flex flex-col z-10 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {/* Progress Bar */}
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${productInfo.bg} transition-all duration-500 ease-out`}
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
        <div className="text-center mt-2 animate-fadeIn">
          <h2 className={`font-bold text-lg ${productInfo.text}`}>VS {scenario.title}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">스위칭 디테일 롤플레잉</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
            {msg.role === 'assistant' && (
               <div className="w-10 h-10 rounded-full border border-slate-200 bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                 <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
               </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
              msg.role === 'user' ? `bg-slate-200 text-slate-800 rounded-tr-sm` : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? <TypewriterText text={msg.content} speed={15} /> : msg.content}
            </div>
          </div>
        ))}
        {interimText && (
          <div className="flex justify-end animate-fadeIn">
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-slate-200 text-slate-500 opacity-70 flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                입력중
                <span className="flex ml-0.5 mt-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </span>
            </div>
          </div>
        )}
        {(!isMicPressed && conversation.status === 'connected' && !conversation.isSpeaking && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') ? (
          <div className="flex justify-start animate-fadeIn">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
               <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
             </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-slate-200 text-slate-400 text-sm font-medium animate-pulse shadow-sm">
              원장님이 생각중입니다...
            </div>
          </div>
        ) : null}
        <div ref={chatEndRef} />
      </div>

      {/* Hint Modal */}
      {showHint && (
        <div className="absolute inset-0 bg-slate-900/40 z-20 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-black text-xl ${productInfo.text}`}>💡 힌트</h3>
              <button onClick={() => setShowHint(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium mb-6 text-sm">
              {scenario.hint}
            </p>
            <button onClick={() => setShowHint(false)} className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-transform active:scale-[0.98] ${productInfo.bg}`}>
              확인했습니다
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="bg-white p-4 z-10 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-slate-100">
        
        {/* Top bar (Hint / Mic / End) */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => setShowHint(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm border border-indigo-100 active:scale-[0.98] transition-transform text-center shadow-sm"
          >
            💡 힌트 보기
          </button>
          
          <div className="flex-1">
            {conversation.status === 'connected' ? (
              <button
                onClick={() => setIsMicPressed(prev => !prev)}
                className={`w-full flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm ${
                  isMicPressed 
                    ? 'bg-rose-100 text-rose-600 border border-rose-200 shadow-inner' 
                    : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                }`}
              >
                {isMicPressed ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMicPressed ? '마이크 끄기' : '마이크 켜기'}
              </button>
            ) : (
              <div className="w-full text-center py-2.5 px-3 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                {isConnecting ? '연결 중...' : '연결 대기 중'}
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1 pr-1 border border-slate-200 focus-within:border-slate-400 focus-within:bg-white transition-colors shadow-inner">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleTextKeyDown}
            placeholder="마이크 대신 텍스트로 대화할 수 있습니다..."
            className="flex-1 bg-transparent text-slate-800 text-[15px] px-3 py-2 outline-none font-medium placeholder-slate-400"
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim()}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white disabled:bg-slate-300 disabled:text-slate-500 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
        
        {/* Complete Button (Only visible if history > 1) */}
        {chatHistory.length > 1 && (
           <button
             onClick={handleEndCall}
             className={`w-full py-4 mt-2 font-black text-lg ${productInfo.btn} flex items-center justify-center gap-2`}
           >
             <CheckCircle className="w-6 h-6" />
             대화 종료 및 평가 받기
           </button>
        )}
      </div>
    </div>
  );
};
