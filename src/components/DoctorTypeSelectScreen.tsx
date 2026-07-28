import React from 'react';
import { DoctorType, Product } from '../types';
import { ArrowLeft } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface DoctorTypeSelectScreenProps {
  product: Product;
  specialtyName: string;
  doctorTypes: DoctorType[];
  onSelectDoctorType: (doctorTypeId: string) => void;
  onBack: () => void;
}

export const DoctorTypeSelectScreen: React.FC<DoctorTypeSelectScreenProps> = ({ product, specialtyName, doctorTypes, onSelectDoctorType, onBack }) => {
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
            어떤 성향의 의사를<br/>만나시겠어요?
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            <span className="text-slate-800 font-bold">{specialtyName}</span> 방문 예정
          </p>
        </div>

        {/* Doctor List */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
          {doctorTypes.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectDoctorType(doc.id);
              }}
              className="w-full bg-white rounded-3xl p-5 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all border border-slate-100"
            >
              {/* Doctor Avatar/Image */}
              <div className="w-16 h-16 shrink-0 rounded-full bg-slate-50 border-2 border-slate-100 overflow-hidden shadow-inner flex items-center justify-center text-3xl">
                {doc.imageUrl ? (
                  <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
                ) : (
                  doc.avatar
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {doc.name}
                  <span className="text-xs text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">
                    난이도 {doc.difficulty}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                  {doc.personality.split('.')[0]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
