import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, User } from 'lucide-react';
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
    // 이름을 따로 묻지 않으므로 사번을 이름으로 임시 사용하거나 담당자로 표시
    onSave({ employeeId: employeeId.trim(), name: employeeId.trim(), department: 'LG화학 영업본부' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">LG화학 AI 디테일링</h2>
            <p className="text-xs text-slate-500 mt-1">롤플레이 트레이닝 시스템</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">사번 <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="예: 234353" autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400" />
              <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {error && <p className="text-xs text-rose-500 font-semibold text-center">{error}</p>}
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
            <span>시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
