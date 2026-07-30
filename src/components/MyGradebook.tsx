import React from 'react';
import { SavedSession } from '../types';
import { Award, Calendar, Trash2 } from 'lucide-react';

interface MyGradebookProps {
  sessions: SavedSession[];
  onDeleteSession: (id: string) => void;
  onSaveBulkSheets?: () => void;
}

export const MyGradebook: React.FC<MyGradebookProps> = ({ sessions, onDeleteSession, onSaveBulkSheets }) => {
  const gradeColors: Record<string, string> = {
    S: 'bg-amber-100 text-amber-700 border-amber-200',
    A: 'bg-blue-100 text-blue-700 border-blue-200',
    B: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    C: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">나의 성적표</h1>
            <p className="text-xs text-slate-500 mt-1">총 {sessions.length}건의 디테일링 기록</p>
          </div>
          {onSaveBulkSheets && sessions.length > 0 && (
            <button
              onClick={onSaveBulkSheets}
              className="px-4 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              📊 시트로 전체 내보내기
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">아직 디테일링 기록이 없습니다.</p>
            <p className="text-xs text-slate-400">디테일링을 시작하면 여기에 결과가 저장됩니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {session.evaluation ? (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border ${gradeColors[session.evaluation.grade || 'C'] || gradeColors.C}`}>
                        {session.evaluation.grade || 'C'}
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border bg-blue-50 text-blue-600 border-blue-200`}>
                        ✓
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {session.productName}
                        <span className="text-xs text-slate-400 font-medium ml-2">{session.doctorTypeName}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{session.date}</span>
                        {session.evaluation && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-blue-600">{session.evaluation.totalScore}점</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onDeleteSession(session.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {session.evaluation?.summary && (
                  <p className="text-xs text-slate-500 font-medium bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    💭 "{session.evaluation.summary}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
