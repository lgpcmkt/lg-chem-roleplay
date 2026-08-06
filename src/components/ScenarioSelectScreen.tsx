import React from 'react';
import { EmployeeInfo, Scenario } from '../types';
import { ArrowLeft, Home } from 'lucide-react';
import { SCENARIOS } from '../data';

interface ScenarioSelectScreenProps {
  employeeInfo: EmployeeInfo;
  product: 'zemiglo' | 'zemimet' | 'zemidapa';
  onSelect: (scenario: Scenario) => void;
  onBack: () => void;
  onHome: () => void;
}

export const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ 
  product, onSelect, onBack, onHome
}) => {
  const scenarios = SCENARIOS[product] || [];
  
  const productName = product === 'zemiglo' ? '제미글로' : product === 'zemimet' ? '제미메트' : '제미다파';

  return (
    <div className="flex-1 flex flex-col bg-transparent text-slate-800 font-sans h-[100dvh] relative overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex items-center p-4 sticky top-0 z-10 bg-transparent">
        <button onClick={onBack} className="p-2 mr-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col flex-1">
          <span className="text-xs font-bold text-blue-500">{productName}</span>
          <span className="text-lg font-black tracking-tight text-slate-800">경쟁품 스위칭 훈련</span>
        </div>
        <button onClick={onHome} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <Home className="w-6 h-6" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {scenarios.map((sc, idx) => (
            <button 
              key={sc.id} 
              onClick={() => onSelect(sc)}
              className="card-modern flex flex-col items-center justify-center p-3 h-[100px] bg-white rounded-[20px] border border-slate-200 hover:border-blue-300 animate-fadeIn active:scale-[0.95]"
              style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
            >
              <div className="w-8 h-8 rounded-full mb-1 flex items-center justify-center text-blue-500 bg-blue-50 font-bold text-xs shadow-inner border border-blue-100">
                VS
              </div>
              <span className="font-bold text-sm text-slate-800 text-center break-keep">{sc.title}</span>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};
