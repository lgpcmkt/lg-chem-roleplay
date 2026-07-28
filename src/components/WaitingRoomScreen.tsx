import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { DoctorType } from '../types';
import { soundEffects } from '../utils/audioEffects';

interface WaitingRoomScreenProps {
  doctorType: DoctorType;
  onEnter: () => void;
}

export const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({ doctorType, onEnter }) => {
  const [isKnocking, setIsKnocking] = useState(false);

  const handleKnock = () => {
    if (isKnocking) return;
    setIsKnocking(true);
    soundEffects.playKnock();
    
    // 1.5초 후 진료실 입장
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full bg-slate-900 overflow-hidden">
      {/* Background Image (Hospital Corridor/Waiting area) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center mix-blend-luminosity transition-all ${isKnocking ? 'animate-door-open' : 'opacity-30'}`}
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop')" }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent transition-opacity duration-1000 ${isKnocking ? 'opacity-0' : 'opacity-100'}`} />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8 text-center animate-fadeIn">
        <div className={`transition-all ${isKnocking ? 'animate-knock' : ''}`}>
          {doctorType.imageUrl ? (
            <img src={doctorType.imageUrl} alt={doctorType.name} className="w-28 h-28 rounded-full object-cover border-4 border-slate-700/50 shadow-2xl mb-6" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-800 text-3xl flex items-center justify-center mb-6 shadow-2xl border-4 border-slate-700/50">
              {doctorType.avatar}
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          {doctorType.name} {doctorType.title}
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-12">
          진료 대기 중입니다.
        </p>

        <button 
          onClick={handleKnock}
          disabled={isKnocking}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isKnocking 
              ? 'bg-slate-700 text-slate-400 scale-95' 
              : 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500 hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isKnocking ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              들어가는 중...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              노크하고 들어가기
            </>
          )}
        </button>
      </div>
    </div>
  );
};
