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
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white text-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-fadeIn">

        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center text-3xl mb-2 shadow-inner border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            제미F<br />디테일 마스터
          </h1>
          <p className="text-slate-500 text-sm font-medium">당신의 디테일 실력을 확인해보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              value={empIdInput}
              onChange={(e) => setEmpIdInput(e.target.value)}
              placeholder="사번 입력 (ex. 123456)"
              autoFocus
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="이름 입력"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          {error && <p className="text-sm text-rose-500 font-bold text-center animate-fadeIn">{error}</p>}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-lg transition-all active:scale-[0.98] shadow-md"
          >
            <span>시작하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
