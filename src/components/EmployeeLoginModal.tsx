import React, { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { EmployeeInfo } from '../types';

interface EmployeeLoginModalProps {
  onSave: (info: EmployeeInfo) => void;
  currentInfo?: EmployeeInfo | null;
  isOpen: boolean;
}

export const EmployeeLoginModal: React.FC<EmployeeLoginModalProps> = ({ onSave, currentInfo, isOpen }) => {
  const [employeeId, setEmployeeId] = useState(currentInfo?.employeeId || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) { setError('사번을 입력해 주세요.'); return; }
    setError('');
    onSave({ employeeId: employeeId.trim(), name: employeeId.trim(), department: 'LG화학 영업본부' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white animate-fadeIn">
      <div className="w-full max-w-sm space-y-10">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <img 
            src="/images/detail_go_logo.png" 
            alt="디테일 GO" 
            className="w-48 md:w-56 object-contain drop-shadow-md animate-float"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <input 
                type="text" 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="사번을 입력하세요" 
                autoFocus
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner" 
              />
              <User className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {error && <p className="text-xs text-rose-500 font-bold text-center animate-knock">{error}</p>}
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[11px] font-bold text-slate-400">개발자: 신채영</p>
      </div>
    </div>
  );
};
