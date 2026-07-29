import React from 'react';
import { Product, Scenario } from '../types';
import { soundEffects } from '../utils/audioEffects';
import { ArrowLeft, Play, UserCircle2 } from 'lucide-react';

interface ScenarioSelectScreenProps {
  product: Product;
  scenarios: Scenario[];
  onSelectScenario: (scenarioId: string) => void;
  onBack: () => void;
}

export const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ product, scenarios, onSelectScenario, onBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto w-full">
      <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={onBack} 
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors mr-1 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${product.color} text-white flex items-center justify-center text-lg shadow-md`}>
            {product.icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 truncate">{product.name}</h2>
            <p className="text-[11px] text-slate-400 font-medium truncate">시나리오 선택</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 animate-fadeIn">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">어떤 상황을 연습해볼까요?</h1>
            <p className="text-sm text-slate-500">고객의 성향과 상황에 맞는 시나리오를 선택해주세요.</p>
          </div>

          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectScenario(scenario.id);
                }}
                className="w-full bg-white rounded-3xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md border border-slate-200 active:scale-[0.99] transition-all group text-left"
              >
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-lg`}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug break-keep">{scenario.title}</h3>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{scenario.difficulty}</span>
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Play className="w-4 h-4 fill-current ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
