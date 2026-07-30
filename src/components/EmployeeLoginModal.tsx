import React, { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white animate-fadeIn">
      {/* Top Right Badge */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-extrabold rounded-full border border-slate-200">사내교육용</span>
      </div>

      <div className="w-full max-w-sm space-y-10">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <img 
            src="/images/detail_go_logo.png" 
            alt="디테일 GO" 
            className="w-48 md:w-56 object-contain mix-blend-multiply animate-float"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative mb-3">
              <input 
                type="text" 
                value={empIdInput} 
                onChange={(e) => setEmpIdInput(e.target.value)}
                placeholder="사번을 입력하세요 (ex. 123456)" 
                autoFocus
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner" 
              />
              <User className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="이름을 입력하세요" 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner" 
              />
              <User className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {error && <p className="text-xs text-rose-500 font-bold text-center animate-knock">{error}</p>}
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center px-4">
        <p className="text-[11px] font-bold text-slate-400">본 앱은 LG화학 영업사원 사내교육용으로 제작되었습니다.</p>
      </div>
    </div>
  );
};
