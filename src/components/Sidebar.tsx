import React from 'react';
import { Home, BookOpen, LogOut, Pill } from 'lucide-react';
import { EmployeeInfo } from '../types';

interface SidebarProps {
  employeeInfo: EmployeeInfo | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ employeeInfo, currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: '디테일링', icon: Home },
    { id: 'gradebook', label: '성적표', icon: BookOpen },
  ];

  return (
    <aside className="shrink-0 bg-slate-900 text-white flex md:flex-col justify-between md:justify-start w-full md:w-60 h-16 md:h-full border-t md:border-t-0 md:border-r border-slate-700/50 relative z-20">
      {/* Logo (Desktop only) */}
      <div className="hidden md:flex px-5 py-5 border-b border-slate-700/50 items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-extrabold tracking-tight truncate">LG화학</h1>
          <p className="text-[10px] text-slate-400 font-medium truncate">AI 디테일링 트레이닝</p>
        </div>
      </div>

      {/* Nav (Bottom on Mobile, Column on Desktop) */}
      <nav className="flex-1 flex md:flex-col justify-center md:justify-start px-2 md:px-3 py-2 md:py-4 gap-2 md:space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-2 md:py-2.5 rounded-xl text-[10px] md:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
        {/* Logout on Mobile only (inside nav) */}
        <button 
          onClick={onLogout}
          className="md:hidden flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">로그아웃</span>
        </button>
      </nav>

      {/* User (Desktop only) */}
      <div className="hidden md:block px-4 py-4 border-t border-slate-700/50 space-y-3">
        {employeeInfo && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
              {employeeInfo.name?.[0] || 'M'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate break-keep">{employeeInfo.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{employeeInfo.employeeId}</p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all">
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
