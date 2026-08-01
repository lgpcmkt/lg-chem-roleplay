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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white font-sans border-x-2 border-black max-w-md mx-auto">
      
      <div className="w-full space-y-10">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-3xl font-black mb-4">제미다파 마스터 챌린지</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6">
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                value={empIdInput} 
                onChange={(e) => setEmpIdInput(e.target.value)}
                placeholder="사번 입력 (ex. 123456)" 
                autoFocus
                className="w-full px-5 py-4 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:bg-gray-100 transition-colors" 
              />
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="이름 입력" 
                className="w-full px-5 py-4 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:bg-gray-100 transition-colors" 
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button 
            type="submit" 
            className="w-full py-4 bg-black text-white font-black text-base border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
