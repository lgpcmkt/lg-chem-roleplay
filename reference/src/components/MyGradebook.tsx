import React, { useEffect, useState } from 'react';
import { SavedSession } from '../types';
import { 
  Award, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Eye, 
  User,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EmployeeInfo } from './EmployeeLoginModal';

interface MyGradebookProps {
  savedSessions: SavedSession[];
  onViewSession: (session: SavedSession) => void;
  onClearHistory: () => void;
  onStartNewRoleplay: () => void;
  onOpenGoogleSheets?: () => void;
  employeeInfo: EmployeeInfo | null;
}

export const MyGradebook: React.FC<MyGradebookProps> = ({
  savedSessions,
  onViewSession,
  onClearHistory,
  onStartNewRoleplay,
  onOpenGoogleSheets,
  employeeInfo,
}) => {
  const [dbLogs, setDbLogs] = useState<any[]>([]);

  useEffect(() => {
    if (employeeInfo?.employeeId) {
      fetch(`/api/learning-logs?employeeId=${employeeInfo.employeeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setDbLogs(data);
        })
        .catch((err) => console.error('Fetch logs error:', err));
    }
  }, [employeeInfo]);

  const totalCompleted = savedSessions.length;
  const averageScore = totalCompleted > 0
    ? Math.round(savedSessions.reduce((acc, curr) => acc + curr.evaluation.totalScore, 0) / totalCompleted)
    : 0;

  const chartData = [...savedSessions]
    .reverse()
    .map((session, index) => ({
      name: `${index + 1}회차`,
      score: session.evaluation.totalScore,
      doctor: session.doctorName,
      date: session.date,
    }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#3182F6]" />
              <h1 className="text-xl font-bold text-slate-900">
                사번별 학습 DB 기록 & 성적표
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              사번: <span className="font-bold text-slate-800">{employeeInfo?.employeeId || '미등록'}</span> ({employeeInfo?.name || 'MR'} / {employeeInfo?.department || '영업부'})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="text-xs text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all border border-emerald-200 flex items-center gap-1.5 font-bold shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets 연동 & 내보내기</span>
              </button>
            )}

            {savedSessions.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all border border-rose-200 flex items-center gap-1.5 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>로컬 기록 초기화</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3182F6] flex items-center justify-center font-bold text-xl">
              📊
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold">누적 시뮬레이션</span>
              <div className="text-2xl font-black text-slate-900">{totalCompleted}회</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              ⭐
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold">평균 역량 점수</span>
              <div className="text-2xl font-black text-[#3182F6]">
                {averageScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              🏆
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold">최고 달성 등급</span>
              <div className="text-2xl font-black text-indigo-600">
                {savedSessions.length > 0
                  ? savedSessions.reduce((max, s) => (s.evaluation.totalScore > max ? s.evaluation.totalScore : max), 0) >= 90
                    ? 'S 등급'
                    : 'A 등급'
                  : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Score Trend Line Chart */}
        {savedSessions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3182F6]" />
              <span>회차별 점수 변화 추이</span>
            </h2>

            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="역량 점수"
                    stroke="#3182F6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3182F6' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Sessions History List */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>사번 DB 학습 이력 기록</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">총 {savedSessions.length}건</span>
          </div>

          {savedSessions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-4xl">📝</div>
              <p className="text-slate-700 text-sm font-bold">아직 저장된 롤플레이 성적표가 없습니다.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                SWITCHING 연구 기반 의사 시뮬레이션을 진행하고 성적표를 등록하세요!
              </p>
              <button
                onClick={onStartNewRoleplay}
                className="mt-2 px-6 py-3 bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-xs rounded-2xl shadow-md"
              >
                첫 롤플레이 시작하기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 md:p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-100 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {session.doctorName} {session.doctorTitle}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">({session.hospital})</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          session.evaluation.grade === 'S' || session.evaluation.grade === 'A'
                            ? 'bg-blue-100 text-[#3182F6]'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {session.evaluation.grade} 등급
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                      "{session.evaluation.summary}"
                    </p>

                    <span className="text-[11px] text-slate-400 block font-medium">{session.date}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xl font-black text-[#3182F6]">
                        {session.evaluation.totalScore}
                      </span>
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </div>

                    <button
                      onClick={() => onViewSession(session)}
                      className="px-4 py-2.5 bg-white hover:bg-[#3182F6] text-slate-700 hover:text-white border border-slate-200 hover:border-[#3182F6] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>성적표 보기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
