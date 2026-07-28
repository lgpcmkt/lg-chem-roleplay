import React, { useState } from 'react';
import { DoctorPersona } from '../types';
import { DOCTOR_3D_IMAGES } from '../assets/doctorImages';
import { getHospitalBackgrounds } from '../assets/backgrounds';
import { soundEffects } from '../utils/audioEffects';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface FlashDoorKnockModalProps {
  doctors: DoctorPersona[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  onKnockAndEnter: () => void;
  onClose?: () => void;
}

export const FlashDoorKnockModal: React.FC<FlashDoorKnockModalProps> = ({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  onKnockAndEnter,
  onClose,
}) => {
  const [isKnocking, setIsKnocking] = useState(false);
  const [knockText, setKnockText] = useState(false);

  const handleKnock = () => {
    setIsKnocking(true);
    setKnockText(true);

    soundEffects.playKnock();

    setTimeout(() => {
      soundEffects.playDoorOpen();
      setTimeout(() => {
        setIsKnocking(false);
        setKnockText(false);
        onKnockAndEnter();
      }, 500);
    }, 600);
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const bgImages = getHospitalBackgrounds(selectedDoctor.hospital);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50 overflow-hidden select-none font-sans text-slate-900">
      {/* Background Real Hospital Waiting Room Image (Clinic vs Hospital Dynamic) */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImages.waitingRoom}
          alt="Hospital Waiting Room"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isKnocking ? 'scale-105 filter brightness-105' : 'scale-100'
          }`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
      </div>

      {/* Knock visual sound ripple text */}
      {knockText && (
        <div className="absolute z-30 top-1/3 text-[#3182F6] font-black text-5xl md:text-7xl tracking-widest animate-ping drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
          똑! 똑! 똑! ✊
        </div>
      )}

      {/* Top Navigation Bar */}
      {onClose && (
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-20 flex justify-between items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 backdrop-blur hover:bg-white text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200/50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">뒤로 나가기</span>
          </button>
        </div>
      )}

      {/* Direct Interactive Game Panel in Clean White */}
      <div className="relative z-10 max-w-xl w-full mx-4 bg-white/95 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-6">
        
        {/* Selected Doctor Avatar Preview */}
        <div className="relative">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-[#3182F6] shadow-[0_0_20px_rgba(49,130,246,0.3)] bg-slate-100">
            <img
              src={DOCTOR_3D_IMAGES[selectedDoctor.id]}
              alt={selectedDoctor.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3182F6] text-white text-xs font-bold px-3.5 py-1 rounded-full whitespace-nowrap shadow-md">
            {selectedDoctor.name} {selectedDoctor.title} ({selectedDoctor.hospital})
          </span>
        </div>

        {/* Doctor Selection Buttons */}
        <div className="w-full space-y-2 pt-2">
          <div className="text-xs text-slate-600 font-bold text-left mb-1">
            담당 의사 선택
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {doctors.map((doc) => {
              const isSelected = doc.id === selectedDoctorId;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    soundEffects.playPing();
                    onSelectDoctor(doc.id);
                  }}
                  className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#3182F6] border-blue-500 text-white shadow-md scale-[1.02] font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                    <img
                      src={DOCTOR_3D_IMAGES[doc.id]}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full space-y-0.5">
                    <div className="text-[11px] font-bold truncate">
                      {doc.name} {doc.title}
                    </div>
                    <div className={`text-[9px] truncate font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {doc.hospital}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Knock Action Button */}
        <div className="w-full pt-1">
          <button
            onClick={handleKnock}
            disabled={isKnocking}
            className="w-full py-4 bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">✊</span>
            <span>디테일 시작하기</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};


