import React from 'react';
import { EmployeeInfo, Scenario } from '../types';
import { ArrowLeft } from 'lucide-react';
import { SCENARIOS } from '../data';

interface ScenarioSelectScreenProps {
  employeeInfo: EmployeeInfo;
  track: 'hospital' | 'local';
  onSelect: (scenario: Scenario) => void;
  onBack: () => void;
}

export const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({
  employeeInfo, track, onSelect, onBack
}) => {
  const scenarios = SCENARIOS[track];

  return (
    <div className="flex-1 flex flex-col bg-white text-black font-sans min-h-screen relative overflow-hidden max-w-md mx-auto border-x-2 border-black">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-black flex justify-between items-center bg-white z-10 shadow-[0_2px_0_rgba(0,0,0,1)]">
        <button onClick={onBack} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center font-bold text-lg">
          {track === 'hospital' ? '종합병원' : '로컬 병의원'} 시나리오 선택
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4 pb-20">
        <p className="font-bold text-sm mb-2">원하시는 원장님을 선택하세요.</p>
        
        {scenarios.map((scenario, idx) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className="w-full text-left pixel-box p-4 border-2 border-black bg-white hover:bg-gray-100 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex flex-col gap-2"
          >
            <div className="font-black text-lg">
              {idx + 1}. {scenario.title}
            </div>
            <div className="text-sm text-gray-600">
              {scenario.missionMsg}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
