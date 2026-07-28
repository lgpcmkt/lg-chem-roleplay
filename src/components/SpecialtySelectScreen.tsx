import React from 'react';
import { Product } from '../types';
import { ArrowLeft } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface SpecialtySelectScreenProps {
  product: Product;
  onSelectSpecialty: (specialtyId: string) => void;
  onBack: () => void;
}

export const SpecialtySelectScreen: React.FC<SpecialtySelectScreenProps> = ({ product, onSelectSpecialty, onBack }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-0 overflow-y-auto w-full px-4">
      <div className="w-full max-w-md md:max-w-3xl pt-8 pb-8 animate-fadeIn">
        
        {/* Back Button */}
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 mb-6 hover:bg-slate-50 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title Area */}
        <div className="mb-10 space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            어느 진료과를<br/>방문하실 예정인가요?
          </h1>
          <p className="text-sm text-slate-500 font-medium">선택하신 제품: <span className="font-bold text-blue-600">{product.name}</span></p>
        </div>

        {/* Specialty List */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
          {product.specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectSpecialty(specialty.id);
              }}
              className="w-full bg-white rounded-3xl p-5 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all border border-slate-100"
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100">
                {specialty.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-900">{specialty.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
