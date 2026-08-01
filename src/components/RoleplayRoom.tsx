import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scenario, EmployeeInfo, ChatMessage } from '../types';
import { ArrowLeft, Mic, Phone, Send, Info, X } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with first message
  useEffect(() => {
    setChatHistory([
      {
        id: 'initial',
        role: 'assistant',
        content: scenario.firstMessage,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [scenario]);

  const conversation = useConversation({
    onMessage: (message) => {
      const role = message.source === 'user' ? 'user' : 'assistant';
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
      alert('연결 실패. 권한을 확인해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndCall = async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
    }
    onEndRoleplay(chatHistory);
  };

  const handleSendText = () => {
    const msg = textInput.trim();
    if (!msg) return;
    
    if (conversation.status === 'connected') {
      conversation.sendUserMessage(msg);
    } else {
      // Offline text chat (fallback or if not connected)
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: msg,
        timestamp: new Date().toISOString()
      }]);
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
    <div className="flex-1 flex flex-col bg-white text-black font-sans min-h-screen relative overflow-hidden max-w-md mx-auto border-x-2 border-black">
      
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
              {msg.content}
            </div>
          </div>
        ))}
        {conversation.isSpeaking && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full border-2 border-black bg-white mr-2 flex items-center justify-center overflow-hidden flex-shrink-0">
               <img src="/images/korean_doctor_strict_clinic_1785413940376.png" alt="doc" className="w-full h-full object-cover" />
             </div>
            <div className="pixel-box px-4 py-3 bg-white text-black text-xs font-bold animate-pulse">
              원장님이 말씀 중...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Hint Modal */}
      {showHint && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
          <div className="pixel-box bg-white p-5 w-full max-w-sm animate-pop-bounce relative shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <button onClick={() => setShowHint(false)} className="absolute top-2 right-2 border-2 border-black p-1 hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold mb-3 flex items-center gap-2">💡 힌트</h3>
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
            💡 힌트 보기
          </button>
          
          <div className="flex gap-2">
            {conversation.status === 'connected' ? (
              <button
                onClick={handleEndCall}
                className="border-2 border-black bg-red-500 text-white w-10 h-10 flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
              >
                <Phone className="w-4 h-4 rotate-[135deg]" />
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                disabled={isConnecting}
                className="border-2 border-black bg-blue-500 text-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] disabled:opacity-50"
              >
                {isConnecting ? '연결 중...' : '🎙️ 음성 시작'}
              </button>
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
