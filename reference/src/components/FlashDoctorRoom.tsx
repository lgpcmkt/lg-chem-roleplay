import React, { useState, useEffect, useRef } from 'react';
import { DoctorPersona, ChatMessage } from '../types';
import { DOCTOR_3D_IMAGES } from '../assets/doctorImages';
import { getHospitalBackgrounds } from '../assets/backgrounds';
import { TypewriterText } from './TypewriterText';
import { soundEffects } from '../utils/audioEffects';
import { 
  Mic, 
  MicOff, 
  Award, 
  ArrowLeft, 
  Clock,
  Sparkles
} from 'lucide-react';

interface FlashDoctorRoomProps {
  doctor: DoctorPersona;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onFinishAndEvaluate: () => void;
  onBackToKnock: () => void;
  employeeName?: string;
}

export const FlashDoctorRoom: React.FC<FlashDoctorRoomProps> = ({
  doctor,
  chatHistory,
  setChatHistory,
  onFinishAndEvaluate,
  onBackToKnock,
  employeeName,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);

  // Dynamic Background according to Clinic vs Hospital
  const bgImages = getHospitalBackgrounds(doctor.hospital);

  // Latest message from Doctor and User
  const latestDoctorMsg = [...chatHistory].reverse().find((m) => m.role === 'assistant');
  const latestUserMsg = [...chatHistory].reverse().find((m) => m.role === 'user');
  const userTurnCount = chatHistory.filter((m) => m.role === 'user').length;

  // State for pop-up motion and sound when doctor speaks a new question
  const [isNewQuestionPop, setIsNewQuestionPop] = useState<boolean>(false);
  const prevDoctorMsgIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (latestDoctorMsg && latestDoctorMsg.id !== prevDoctorMsgIdRef.current) {
      prevDoctorMsgIdRef.current = latestDoctorMsg.id;
      soundEffects.playDoctorAlert();
      setIsNewQuestionPop(true);
      const timer = setTimeout(() => {
        setIsNewQuestionPop(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [latestDoctorMsg?.id]);

  // Web Speech Recognition setup for MR user voice input
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
        isRecordingRef.current = false;
      };

      rec.onend = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (!speechSupported || isRecordingRef.current) return;
    try {
      recognitionRef.current?.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.error('Failed to start microphone:', err);
    }
  };

  const stopListening = () => {
    if (isRecordingRef.current) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. 키보드로 입력해 주세요.');
      return;
    }
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Send message to Doctor AI
  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim() || isLoading) return;

    stopListening();
    soundEffects.playPing();

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
          userName: employeeName,
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
      }
    } catch (error) {
      console.error('Doctor AI error:', error);
      const fallbackReply = 'SWITCHING 연구에서 기존 met/dpp-4i/sglt-2i 3제 치료 환자를 제미다파로 교체했을 때 추가 혈당 강하 데이터가 궁금하군요. 자세히 설명해 주시겠습니까?';
      const doctorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory([...newHistory, doctorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50 text-slate-900 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Real Hospital Doctor Office Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImages.doctorOffice}
          alt="Hospital Doctor Office"
          className="w-full h-full object-cover brightness-[0.95] opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      </div>

      {/* Top HUD Bar */}
      <div className="z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-5 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToKnock}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">진료실 나가기</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Real Human Doctor Info Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#3182F6] shrink-0 shadow-sm bg-slate-100">
              <img
                src={DOCTOR_3D_IMAGES[doctor.id]}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {doctor.name} {doctor.title}
                </span>
                <span className="text-[10px] bg-blue-50 text-[#3182F6] border border-blue-200 px-2 py-0.2 rounded font-bold">
                  {doctor.hospital}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block font-medium">
                성향: {doctor.focusArea}
              </p>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Turn Counter */}
          <div className="flex items-center gap-1.5 bg-slate-100 text-[#3182F6] border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>대화 턴 {userTurnCount}/7</span>
          </div>

          {/* Finish Roleplay */}
          <button
            onClick={onFinishAndEvaluate}
            className="px-4 py-2 bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>대화 완료 & 채점</span>
          </button>
        </div>
      </div>

      {/* Main Doctor Stage Scene */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-6 z-10 overflow-y-auto">
        
        {/* Doctor Dialogue Box */}
        <div className="relative flex flex-col items-center max-w-xl w-full">
          
          {/* Doctor Speech Card */}
          <div className={`w-full bg-white/98 border-2 rounded-3xl p-6 shadow-xl backdrop-blur-md mb-6 relative transition-all duration-300 ${
            isNewQuestionPop
              ? 'border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-pop-bounce scale-105'
              : 'border-[#3182F6]'
          }`}>
            <div className="text-xs text-[#3182F6] font-bold mb-2 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3182F6]" />
                <span>{doctor.name} {doctor.title} ({doctor.hospital})</span>
              </div>
            </div>

            <p className="text-base md:text-lg font-bold text-slate-900 leading-relaxed min-h-[3rem]">
              "<TypewriterText text={latestDoctorMsg ? latestDoctorMsg.content : doctor.initialMessage} speed={25} />"
            </p>

            {/* Speech Arrow */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] ${
              isNewQuestionPop ? 'border-t-amber-400' : 'border-t-[#3182F6]'
            }`} />
          </div>

          {/* Doctor Real Photo Character (Without overlapping badge) */}
          <div className="relative group">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative bg-slate-100 shadow-blue-500/10">
              <img
                src={DOCTOR_3D_IMAGES[doctor.id]}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Latest Spoken Transcript Display with Typewriter animation */}
        {latestUserMsg && (
          <div className="mt-6 max-w-lg w-full bg-white/95 border border-slate-200 rounded-2xl p-3.5 text-center text-xs text-slate-800 shadow-md">
            <span className="font-bold text-[#3182F6]">{employeeName ? `${employeeName} MR` : 'MR (영업사원)'} 답변: </span>
            "<TypewriterText text={latestUserMsg.content} speed={20} />"
          </div>
        )}
      </div>

      {/* Bottom Voice & Text Console */}
      <div className="z-20 bg-white/98 border-t border-slate-200 p-4 md:p-5 backdrop-blur-md flex flex-col items-center space-y-3 shadow-xl">
        
        {/* Microphone and Text Input Controls */}
        <div className="w-full max-w-2xl flex items-center gap-3">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            disabled={isLoading}
            className={`p-4 rounded-2xl border-2 shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
              isRecording
                ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-[#3182F6] hover:bg-[#1B64DA] border-blue-400 text-white shadow-blue-500/20'
            }`}
            title="마이크로 음성 답변하기"
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="font-bold text-xs hidden sm:inline">
              {isRecording ? '음성 녹음 중...' : '마이크 답변'}
            </span>
          </button>

          {/* Text Input Field */}
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="답변을 말하거나 텍스트로 입력하세요..."
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-semibold"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-[#3182F6] hover:bg-[#1B64DA] disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shrink-0"
            >
              전송
            </button>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        {isLoading && (
          <div className="text-center text-xs font-bold text-[#3182F6] animate-pulse">
            ⚡ {doctor.name} {doctor.title}이 MR 답변을 듣고 검토 중입니다...
          </div>
        )}
      </div>
    </div>
  );
};

