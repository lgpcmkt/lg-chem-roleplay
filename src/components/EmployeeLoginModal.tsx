import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { EmployeeInfo } from '../types';

interface EmployeeLoginModalProps {
  onSave: (info: EmployeeInfo) => void;
  currentInfo?: EmployeeInfo | null;
  isOpen: boolean;
}

export const EmployeeLoginModal: React.FC<EmployeeLoginModalProps> = ({ onSave, currentInfo, isOpen }) => {
  const [nameInput, setNameInput] = useState(currentInfo?.name || '');
  const [empIdInput, setEmpIdInput] = useState(currentInfo?.employeeId || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empIdInput.trim()) { setError('사번을 입력해 주세요.'); return; }
    if (!/^\d{6,7}$/.test(empIdInput.trim())) { setError('사번은 6~7자리 숫자로 입력해 주세요.'); return; }
    if (!nameInput.trim()) { setError('이름을 입력해 주세요.'); return; }
    
    setError('');
    onSave({ employeeId: empIdInput.trim(), name: nameInput.trim(), department: 'LG화학 영업본부' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 font-sans p-4">
      
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center animate-slideUp">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mb-2 shadow-inner">
            🔥
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            제미패밀리<br/>디테일 마스터
          </h1>
          <p className="text-slate-500 text-sm font-medium">당신의 디테일링 실력을 확인해보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3">
            <input 
              type="text" 
              value={empIdInput} 
              onChange={(e) => setEmpIdInput(e.target.value)}
              placeholder="사번 입력 (ex. 123456)" 
              autoFocus
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors shadow-inner" 
            />
            <input 
              type="text" 
              value={nameInput} 
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="이름 입력" 
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors shadow-inner" 
            />
          </div>
          {error && <p className="text-sm text-rose-500 font-bold text-center animate-fadeIn">{error}</p>}
          <button 
            type="submit" 
            className="w-full py-4 mt-2 btn-duo-orange flex items-center justify-center gap-2 text-lg"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
