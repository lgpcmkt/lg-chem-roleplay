import React, { useEffect, useState } from 'react';
import { EmployeeInfo, HistoryRecord, RoleplayEvaluationResult } from '../types';
import { ArrowLeft } from 'lucide-react';
import { SCENARIOS } from '../data';

interface HistoryScreenProps {
  employeeInfo: EmployeeInfo;
  onBack: () => void;
  onSelectRecord: (evaluation: RoleplayEvaluationResult) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ employeeInfo, onBack, onSelectRecord }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/history/${employeeInfo.employeeId}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [employeeInfo.employeeId]);

  const getProductName = (track: string) => {
    if (track === 'zemiglo') return '제미글로';
    if (track === 'zemimet') return '제미메트';
    if (track === 'zemidapa') return '제미다파';
    return track;
  };

  const getCompetitorName = (scenarioId: string) => {
    const scenario = SCENARIOS.zemiglo.find(s => s.id === scenarioId) ||
                     SCENARIOS.zemimet.find(s => s.id === scenarioId) ||
                     SCENARIOS.zemidapa.find(s => s.id === scenarioId);
    return scenario ? scenario.title : scenarioId;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'A': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'B': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'C': return 'text-rose-500 bg-rose-50 border-rose-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}.${dd} ${hh}:${min}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-500 font-sans h-full">
        <p className="animate-pulse font-bold">기록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 font-sans h-[100dvh] relative overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-4 flex flex-col items-center z-10 sticky top-0 bg-white border-b border-slate-200">
        <div className="w-full flex items-center mb-2">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center font-black text-lg tracking-tight text-slate-800 pr-6">
            연습 기록 점검
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            누적 {records.length}회 플레이
          </span>
        </div>
      </div>

      {/* Record List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-12">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
            <p className="font-bold">아직 연습 기록이 없습니다.</p>
            <p className="text-sm mt-1">디테일 롤플레잉에 도전해보세요!</p>
          </div>
        ) : (
          records.map((record) => (
            <div 
              key={record.id}
              onClick={() => {
                if (record.evaluation_data) {
                  onSelectRecord(record.evaluation_data);
                } else {
                  alert("상세 채점 기록이 저장되지 않은 옛날 세션입니다.");
                }
              }}
              className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all active:scale-[0.98]"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400">
                  {record.timestamp ? formatDate(record.timestamp) : '시간 정보 없음'}
                </span>
                <span className="font-black text-slate-800">
                  {getProductName(record.track)} <span className="text-slate-400 font-medium">vs</span> {getCompetitorName(record.scenario_id)}
                </span>
              </div>
              
              <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 shadow-sm shrink-0 ml-4 ${getGradeColor(record.grade)}`}>
                <span className="text-lg font-black">{record.grade}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
