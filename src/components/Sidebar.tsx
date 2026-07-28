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
    { id: 'dashboard', label: '디테일링 시작', icon: Home },
    { id: 'gradebook', label: '나의 성적표', icon: BookOpen },
  ];

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">LG화학</h1>
            <p className="text-[10px] text-slate-400 font-medium">AI 디테일링 트레이닝</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700/50 space-y-3">
        {employeeInfo && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {employeeInfo.name?.[0] || 'M'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{employeeInfo.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{employeeInfo.employeeId}</p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all">
          <LogOut className="w-3.5 h-3.5" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
