import React from 'react';
import { 
  Bot, 
  Award, 
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'gradebook';
  setActiveTab: (tab: 'dashboard' | 'gradebook') => void;
  savedSessionsCount: number;
  employeeInfo?: { name?: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedSessionsCount,
  employeeInfo,
}) => {
  const displayName = employeeInfo?.name || '제미다파';
  const navItems = [
    {
      id: 'dashboard',
      label: '학습 시작',
      subLabel: 'AI 의사 롤플레이',
      icon: Bot,
      badge: 'SWITCHING',
    },
    {
      id: 'gradebook',
      label: '나의 성적표',
      subLabel: '사번 DB 역량 기록',
      icon: Award,
      count: savedSessionsCount,
    },
  ];

  return (
    <>
      {/* Mobile Top Header Navigation */}
      <header className="md:hidden bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center justify-between px-4 py-3 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3182F6] flex items-center justify-center text-white font-black text-base shadow-sm">
            {displayName[0] || '제'}
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1">
              {displayName} <span className="text-[9px] bg-blue-500/20 text-[#3182F6] border border-blue-500/30 px-1 py-0.2 rounded-full font-bold">AI MR</span>
            </h1>
          </div>
        </div>

        {/* Mobile Tab Buttons */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#3182F6] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col border-r border-slate-800 shrink-0 select-none font-sans">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3182F6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xl">
              {displayName[0] || '제'}
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                {displayName} <span className="text-[10px] bg-blue-500/20 text-[#3182F6] border border-blue-500/30 px-1.5 py-0.2 rounded-full font-bold">AI MR</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">SWITCHING 임상 시뮬레이터</p>
            </div>
          </div>

          {/* Product Badge */}
          <div className="mt-2 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="font-bold text-white text-xs">제미글립틴 + 다파글리플로진</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              FDC
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            학습 메뉴
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all text-left ${
                  isActive
                    ? 'bg-[#3182F6] text-white font-bold shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      {item.label}
                      {item.badge && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {item.subLabel}
                    </div>
                  </div>
                </div>

                {item.count !== undefined && (
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-bold">
          LG Chem MR Training AI System
        </div>
      </aside>
    </>
  );
};
