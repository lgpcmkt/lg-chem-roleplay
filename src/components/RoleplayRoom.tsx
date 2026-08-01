import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scenario, EmployeeInfo, ChatMessage } from '../types';
import { ArrowLeft, Mic, Phone, Send, Info, X } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { TypewriterText } from './TypewriterText';

interface RoleplayRoomProps {
  scenario: Scenario;
  employeeInfo: EmployeeInfo;
  onEndRoleplay: (chatHistory: ChatMessage[]) => void;
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
          let finalTranscript = '';
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setChatHistory(prev => [...prev, {
              id: Date.now().toString(),
              role: 'user',
              content: finalTranscript,
              timestamp: new Date().toISOString()
            }]);
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
    if (isMicPressed) {
      setInterimText('');
      try { recognitionRef.current.start(); } catch (e) {}
    } else {
      try { recognitionRef.current.stop(); } catch (e) {}
      if (interimText.trim()) {
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: interimText,
          timestamp: new Date().toISOString()
        }]);
        setInterimText('');
      }
    }
  }, [isMicPressed]);


  const conversation = useConversation({
    onMessage: (message: any) => {
      const role = message.source === 'user' || message.role === 'user' ? 'user' : 'assistant';
      // Ignore ElevenLabs user transcripts if we have SpeechRecognition initialized, to avoid duplicates.
      // But if it's an assistant message, always show it.
      if (role === 'user' && recognitionRef.current) return;

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role,
        content: message.message,
        timestamp: new Date().toISOString()
      }]);
    },
    onError: (error) => console.error('[ElevenLabs Error]', error)
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle Push-to-Talk (Mute when not pressed)
  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setMuted(!isMicPressed);
    }
  }, [isMicPressed, conversation.status]);

  const handleStartCall = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          doctor_persona: scenario.title,
          mission: scenario.missionMsg || '',
          first_message: scenario.firstMessage
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
    if (conversation.status === 'connected') {
      await conversation.endSession();
    }
    onEndRoleplay(chatHistory);
  };

  const handleSendText = () => {
    const msg = textInput.trim();
    if (!msg) return;
    
    // Always show what the user typed in the UI
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

  return (
    <div className="flex-1 flex flex-col bg-white text-black font-sans h-[100dvh] relative overflow-hidden max-w-md mx-auto border-x-2 border-black">
      
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-black flex justify-between items-center bg-white z-10 shadow-[0_2px_0_rgba(0,0,0,1)]">
        <button onClick={onBack} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center font-bold">
          <div className="text-xs text-gray-500">[{scenario.track === 'hospital' ? '종합병원' : '로컬 병의원'}]</div>
          <div className="text-lg">{scenario.title}</div>
        </div>
        <div className="w-8" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-32">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
               <div className="w-8 h-8 rounded-full border-2 border-black bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                 <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
               </div>
            )}
            <div className={`max-w-[75%] pixel-box px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-black text-white ml-2' : 'bg-white text-black'
            }`}>
              {msg.role === 'assistant' ? <TypewriterText text={msg.content} speed={20} /> : msg.content}
            </div>
          </div>
        ))}
        {interimText && (
          <div className="flex justify-end">
            <div className="max-w-[75%] pixel-box px-4 py-3 text-sm leading-relaxed bg-black text-white ml-2 opacity-70">
              {interimText}
            </div>
          </div>
        )}
        {isMicPressed ? (
          <div className="flex justify-end">
            <div className="pixel-box px-4 py-3 bg-red-100 text-red-600 text-xs font-bold animate-pulse border-red-400">
              음성 입력 중입니다...
            </div>
          </div>
        ) : conversation.isSpeaking ? (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full border-2 border-black bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0">
               <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
             </div>
            <div className="pixel-box px-4 py-3 bg-white text-black text-xs font-bold animate-pulse">
              원장님이 말씀 중...
            </div>
          </div>
        ) : conversation.status === 'connected' ? (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full border-2 border-black bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0">
               <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
             </div>
            <div className="pixel-box px-4 py-3 bg-gray-100 text-gray-500 text-xs font-bold animate-pulse">
              원장님이 생각중입니다...
            </div>
          </div>
        ) : null}
        <div ref={chatEndRef} />
      </div>

      {/* Hint Modal */}
      {showHint && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
          <div className="pixel-box bg-white p-5 w-full max-w-sm animate-pop-bounce relative shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <button onClick={() => setShowHint(false)} className="absolute top-2 right-2 border-2 border-black p-1 hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold mb-3 flex items-center gap-2">힌트</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{scenario.hint}</p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 border-t-2 border-black bg-white p-3 z-10 flex flex-col gap-2">
        
        {/* Call Controls */}
        <div className="flex justify-between items-center gap-2 mb-1 px-1">
          <button
            onClick={() => setShowHint(true)}
            className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
          >
            힌트 보기
          </button>
          
          <div className="flex gap-2">
            {conversation.status === 'connected' ? (
              <button
                onClick={() => setIsMicPressed(prev => !prev)}
                className={`border-2 border-black flex items-center justify-center px-4 py-1 text-sm font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] transition-colors select-none ${
                  isMicPressed 
                    ? 'bg-red-500 text-white shadow-none translate-y-[2px] translate-x-[2px]' 
                    : 'bg-green-400 text-black'
                }`}
              >
                <Mic className="w-4 h-4 mr-1" />
                {isMicPressed ? '음성 입력 완료하기' : '마이크 켜기 (토글)'}
              </button>
            ) : (
              <div className="px-3 py-1 text-xs font-bold text-gray-500 border-2 border-transparent">
                {isConnecting ? '연결 중...' : '연결 대기 중'}
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleTextKeyDown}
            placeholder="텍스트로 입력..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim()}
            className="w-8 h-8 bg-black flex items-center justify-center text-white disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Complete Button (Only visible if history > 1) */}
        {chatHistory.length > 1 && (
           <button
             onClick={handleEndCall}
             className="w-full mt-1 border-2 border-black bg-green-400 text-black font-bold py-2 shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
           >
             대화 종료 및 평가 받기
           </button>
        )}

      </div>
    </div>
  );
};
