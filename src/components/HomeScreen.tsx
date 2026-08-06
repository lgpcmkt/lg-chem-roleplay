import React, { useEffect, useState } from 'react';
import { UserProgress, EmployeeInfo } from '../types';
import { LogOut, ChevronRight } from 'lucide-react';

interface HomeScreenProps {
  employeeInfo: EmployeeInfo;
  onLogout: () => void;
  onSelectProduct: (product: 'zemiglo' | 'zemimet' | 'zemidapa') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ employeeInfo, onLogout, onSelectProduct }) => {
  const [progress, setProgress] = useState<UserProgress>({ zemiglo: 0, zemimet: 0, zemidapa: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch progress from backend
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/progress/${employeeInfo.employeeId}`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (err) {
        console.error('Failed to fetch progress', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [employeeInfo.employeeId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <p className="animate-pulse font-bold">로딩중...</p>
      </div>
    );
  }

  const products = [
    { id: 'zemiglo', name: '제미글로', desc: '강력하고 안전한 DPP-4 억제제', colorClass: 'text-blue-500 bg-blue-50', icon: 'Z' },
    { id: 'zemimet', name: '제미메트', desc: '제미글로+메트포르민 복합제', colorClass: 'text-blue-500 bg-blue-50', icon: 'M' },
    { id: 'zemidapa', name: '제미다파', desc: '제미글로+다파글리플로진 복합제', colorClass: 'text-blue-500 bg-blue-50', icon: 'D' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-transparent text-slate-800 font-sans h-full pt-6 pb-6">

      {/* Header Info */}
      <div className="w-full max-w-md px-6 flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-sm font-bold">{employeeInfo.name} 님</span>
          <span className="text-xs font-medium text-slate-500">이번 달 누적 연습: {progress.totalPlays || 0}회</span>
        </div>
        <button onClick={onLogout} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Title */}
      <div className="w-full max-w-md px-6 mb-6 text-left animate-fadeIn">
        <h1 className="text-2xl font-black mb-1 text-slate-800 tracking-tight leading-snug">
          오늘은 어떤 제품 디테일을<br/>연습해볼까요?
        </h1>
        <p className="text-slate-500 text-sm font-medium">제품을 선택하고 경쟁품 스위칭에 도전하세요!</p>
      </div>

      {/* Product List */}
      <div className="w-full max-w-md px-6 flex flex-col gap-4 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        {products.map((p) => {
          return (
            <div 
              key={p.id}
              onClick={() => onSelectProduct(p.id)}
              className="card-modern p-4 mb-3 mx-6 flex items-center justify-between group active:scale-[0.98] bg-white rounded-[24px] border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform ${p.colorClass}`}>
                  {p.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black text-slate-800">{p.name}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 font-medium">{p.desc}</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          );
        })}
      </div>
      
      <div className="w-full max-w-md px-6 mt-auto pb-6">
        <button className="w-full py-4 bg-blue-50 text-blue-600 font-bold rounded-[20px] text-sm">
          내 연습 기록 점검하기
        </button>
      </div>
    </div>
  );
};
