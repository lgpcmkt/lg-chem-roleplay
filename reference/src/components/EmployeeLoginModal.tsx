import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';

export interface EmployeeInfo {
  employeeId: string;
  name: string;
  department: string;
}

interface EmployeeLoginModalProps {
  onSave: (info: EmployeeInfo) => void;
  currentInfo?: EmployeeInfo | null;
  isOpen: boolean;
  onClose?: () => void;
}

export const EmployeeLoginModal: React.FC<EmployeeLoginModalProps> = ({
  onSave,
  currentInfo,
  isOpen,
  onClose,
}) => {
  const [employeeId, setEmployeeId] = useState(currentInfo?.employeeId || '');
  const [name, setName] = useState(currentInfo?.name || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('사번을 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setError('');
    onSave({
      employeeId: employeeId.trim(),
      name: name.trim(),
      department: 'LG화학 영업본부',
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 font-sans space-y-6">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3182F6] flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              LG화학 디테일 롤플레잉
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              사번 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="예: 20240101"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#3182F6] focus:bg-white transition-all placeholder:text-slate-400"
                autoFocus
              />
              <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              이름 (성함) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#3182F6] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-semibold text-center pt-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

