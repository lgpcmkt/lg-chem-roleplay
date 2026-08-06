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
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 font-sans min-h-screen relative">
      
      {/* Header */}
      <div className="w-full flex items-center p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 mr-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div className="flex flex-col">
          <span className={`text-xs font-bold ${productInfo.text}`}>{productInfo.name}</span>
          <span className="text-lg font-black tracking-tight text-slate-800">어떤 경쟁품 스위칭을 도전할까요?</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 flex flex-col gap-3">
        {scenarios.map((sc, idx) => (
          <div 
            key={sc.id} 
            className="card-duo p-4 flex flex-col gap-3 group animate-fadeIn"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-lg ${productInfo.bg}`}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{sc.title}</h3>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1 font-bold">원장님 예상 반응:</p>
              <p className="text-sm text-slate-700">"{sc.firstMessage}"</p>
            </div>
            
            <button 
              onClick={() => onSelect(sc)}
              className={`mt-1 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${productInfo.bg} shadow-md`}
            >
              <PlayCircle className="w-5 h-5" />
              도전하기
            </button>
          </div>
        ))}
      </div>
      
    </div>
  );
};
