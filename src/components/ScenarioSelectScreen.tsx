import React from 'react';
import { EmployeeInfo, Scenario } from '../types';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { SCENARIOS } from '../data';

interface ScenarioSelectScreenProps {
  employeeInfo: EmployeeInfo;
  product: 'zemiglo' | 'zemimet' | 'zemidapa';
  onSelect: (scenario: Scenario) => void;
  onBack: () => void;
}

export const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ 
  product, onSelect, onBack 
}) => {
  const scenarios = SCENARIOS[product] || [];
  
  const productInfo = {
    zemiglo: { name: '제미글로', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    zemimet: { name: '제미메트', bg: 'bg-[#78350f]', text: 'text-[#78350f]', border: 'border-[#78350f]' },
    zemidapa: { name: '제미다파', bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' }
  }[product];

  return (
    <div className="flex-1 flex flex-col bg-transparent text-white font-sans min-h-screen relative">
      
      {/* Header */}
      <div className="w-full flex items-center p-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 mr-2 hover:bg-white/10 rounded-full transition-colors text-white/80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white/80">{productInfo.name}</span>
          <span className="text-lg font-black tracking-tight text-white">어떤 경쟁품 스위칭을 도전할까요?</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {scenarios.map((sc, idx) => (
            <button 
              key={sc.id} 
              onClick={() => onSelect(sc)}
              className={`card-modern flex flex-col items-center justify-center p-4 min-h-[120px] animate-fadeIn active:scale-[0.95]`}
              style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
            >
              <div className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center text-white font-bold text-sm shadow-sm ${productInfo.bg}`}>
                VS
              </div>
              <span className="font-bold text-base text-slate-800 text-center break-keep">{sc.title}</span>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};
