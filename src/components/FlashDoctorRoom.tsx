import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, MessageCircle, CheckCircle2, Circle, Mic, Volume2, Square, ArrowLeft } from 'lucide-react';
import { ChatMessage, Product, DoctorType, Specialty } from '../types';
import { TypewriterText } from './TypewriterText';
import { soundEffects } from '../utils/audioEffects';

interface FlashDoctorRoomProps {
  product: Product;
  specialty: Specialty;
  doctorType: DoctorType;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onEndRoleplay: () => void;
  isLoading: boolean;
  isFinalTurn: boolean;
  turnCount: number;
  checklistStatus: Record<string, boolean>;
  checklistItems: { key: string; label: string }[];
  onBack?: () => void;
}

export const FlashDoctorRoom: React.FC<FlashDoctorRoomProps> = ({
  product, specialty, doctorType, chatHistory, onSendMessage, onEndRoleplay,
  isLoading, isFinalTurn, turnCount, checklistStatus, checklistItems, onBack
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.1;
      
      // friendly(김민희 과장)는 여성(높은 피치), 나머지는 남성(낮은 피치)
      utterance.pitch = doctorType.id === 'friendly' ? 1.3 : 0.6; 
      
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      
      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    } else {
      alert('현재 기기에서는 음성 듣기를 지원하지 않습니다.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('스마트폰이나 현재 브라우저에서는 마이크 음성 인식을 지원하지 않거나 권한이 차단되었습니다. (사파리나 크롬 최신 버전을 권장합니다)');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = false;

    const applyMedicalTerms = (text: string) => {
      return text
        // DPP-4i
        .replace(/디피포/g, 'DPP-4i').replace(/디 피 포/g, 'DPP-4i')
        .replace(/디피피포/g, 'DPP-4i').replace(/디 피 피 포/g, 'DPP-4i')
        .replace(/dpp4/gi, 'DPP-4i')
        // SGLT-2i
        .replace(/에스지엘티투/g, 'SGLT-2i').replace(/에스 지 엘 티 투/g, 'SGLT-2i')
        .replace(/sglt2/gi, 'SGLT-2i')
        // FDC
        .replace(/에프디씨/g, 'FDC').replace(/에프 디 씨/g, 'FDC')
        .replace(/fdc/gi, 'FDC')
        // Zemidapa
        .replace(/제 이다파/g, '제미다파').replace(/제미 다파/g, '제미다파')
        .replace(/재미다파/g, '제미다파').replace(/제미다 파/g, '제미다파')
        // Vimovo
        .replace(/비무보/g, '비모보').replace(/비 무 보/g, '비모보')
        .replace(/비모 보/g, '비모보').replace(/비 모보/g, '비모보')
        // Zemiglo / Zemimet
        .replace(/재미글로/g, '제미글로').replace(/제미 글로/g, '제미글로')
        .replace(/재미메트/g, '제미메트').replace(/제미 매트/g, '제미메트')
        .replace(/재미매트/g, '제미메트').replace(/제미 메트/g, '제미메트');
    };

    let originalInput = input;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      let currentText = originalInput + (originalInput && (finalTranscript || interimTranscript) ? ' ' : '') + finalTranscript + interimTranscript;
      setInput(applyMedicalTerms(currentText));

      if (finalTranscript) {
        originalInput = originalInput + (originalInput ? ' ' : '') + applyMedicalTerms(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('마이크 사용 권한이 차단되었습니다. 기기 설정에서 마이크 권한을 허용해주세요.');
      } else {
        alert(`음성 인식 오류가 발생했습니다: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const userTurnCount = chatHistory.filter(m => m.role === 'user').length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full">
      {/* Top Bar */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBack && (
            <button 
              onClick={onBack} 
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors mr-1 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${product.color} text-white flex items-center justify-center text-lg shadow-md`}>
            {product.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 truncate">{doctorType.name} {doctorType.title}</h2>
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{specialty.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">{product.name} 디테일링</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0 ml-2">
          <button onClick={onEndRoleplay}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">대화 종료 & 평가 보기</span>
            <span className="sm:hidden">평가 받기</span>
          </button>
        </div>
      </div>

      {/* Main Content: Chat + Checklist */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* Hospital Background */}
          <div className="absolute inset-0 bg-slate-50 opacity-90 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
                {msg.role === 'assistant' && (
                  doctorType.imageUrl ? (
                    <img src={doctorType.imageUrl} alt={doctorType.name} className="shrink-0 w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm mr-2 mt-1" />
                  ) : (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm mr-2 mt-1 shadow-sm">
                      {doctorType.avatar}
                    </div>
                  )
                )}
                <div className="flex flex-col gap-1 items-start max-w-[85%] md:max-w-[75%]">
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white/95 backdrop-blur-sm text-slate-800 border border-slate-200/50 rounded-bl-sm'
                    }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`ml-1 flex items-center gap-1 text-[10px] transition-colors ${
                        speakingMsgId === msg.id ? 'text-blue-600 font-bold animate-pulse' : 'text-slate-400 hover:text-blue-500'
                      }`}
                    >
                      {speakingMsgId === msg.id ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-blue-600" />
                          <span>중단하기</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>음성 듣기</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeIn z-10">
                {doctorType.imageUrl ? (
                  <img src={doctorType.imageUrl} alt={doctorType.name} className="shrink-0 w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm mr-2 mt-1" />
                ) : (
                  <div className="shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm mr-2 mt-1 shadow-sm">{doctorType.avatar}</div>
                )}
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 px-4 py-3 bg-white/90 backdrop-blur-md border-t border-slate-200/50">
            <div className="flex items-end gap-2 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "듣고 있습니다..." : "메시지 입력..."}
                rows={1}
                disabled={isLoading}
                className={`flex-1 pl-4 pr-12 py-3 border rounded-2xl text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${isRecording
                    ? 'bg-rose-50 border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                style={{ maxHeight: '120px' }}
              />

              <button
                onClick={toggleRecording}
                disabled={isLoading}
                className={`absolute right-16 bottom-1.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 ${isRecording
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button onClick={handleSend} disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Checklist */}
        <div className="hidden lg:flex w-56 shrink-0 border-l border-slate-200 bg-white p-4 flex-col">
          <h3 className="text-xs font-extrabold text-slate-700 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            실시간 미션
          </h3>
          <div className="space-y-2.5">
            {checklistItems.map((item) => (
              <div key={item.key} className={`flex items-center gap-2 text-xs font-medium transition-all ${checklistStatus[item.key] ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                {checklistStatus[item.key] ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={checklistStatus[item.key] ? 'line-through' : ''}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              완료: {Object.values(checklistStatus).filter(Boolean).length}/{checklistItems.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
