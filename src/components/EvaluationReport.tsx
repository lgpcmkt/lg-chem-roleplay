import React from 'react';
import { RoleplayEvaluationResult } from '../types';
import { RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  onRetry: () => void;
  onClose: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation, onRetry, onClose
}) => {
  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'S': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'A': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'B': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'C': return 'text-rose-500 bg-rose-50 border-rose-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-slate-50 text-slate-800 font-sans min-h-screen overflow-y-auto p-4 pb-12 w-full">

      <div className="w-full max-w-md bg-white rounded-3xl p-6 flex flex-col items-center shadow-lg border border-slate-100 animate-slideUp mt-4">
        
        <div className="flex items-center gap-2 mb-6">
          {evaluation.isSuccess ? (
             <CheckCircle className="w-8 h-8 text-emerald-500" />
          ) : (
             <XCircle className="w-8 h-8 text-rose-500" />
          )}
          <h2 className="text-2xl font-black tracking-tight text-slate-800">
             {evaluation.isSuccess ? '스위칭 성공!' : '스위칭 실패'}
          </h2>
        </div>

        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 mb-6 shadow-sm ${getGradeColor(evaluation.grade)}`}>
          <span className="text-5xl font-black tracking-tighter">{evaluation.grade}</span>
          <span className="text-sm font-bold mt-1 opacity-80">등급</span>
        </div>

        {evaluation.totalScore !== undefined && (
          <div className="text-xl font-bold mb-6 text-slate-600 bg-slate-100 px-6 py-2 rounded-2xl">
            총점: <span className="text-slate-800">{evaluation.totalScore}</span> / 100
          </div>
        )}

        <div className="w-full text-left flex flex-col gap-4 mb-8">
          {evaluation.reasoning && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">👨‍⚕️ 원장님의 코멘트</h3>
              <p className="text-sm leading-relaxed text-slate-600 font-medium">{evaluation.reasoning}</p>
            </div>
          )}

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-700 mb-2">✨ 잘한 점</h4>
            {evaluation.strengths && evaluation.strengths.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-600 font-medium">
                {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-emerald-600 font-medium opacity-80">특별히 관찰된 내용이 없습니다.</p>
            )}
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
            <h4 className="font-bold text-rose-700 mb-2">🎯 보완점</h4>
            {evaluation.weaknesses && evaluation.weaknesses.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1 text-rose-600 font-medium">
                {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-rose-600 font-medium opacity-80">특별히 관찰된 내용이 없습니다.</p>
            )}
          </div>
          
          {evaluation.recommendedScript && (
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <h3 className="font-bold text-indigo-700 mb-2">💡 추천 디테일 멘트</h3>
              <p className="text-sm italic leading-relaxed text-indigo-600 font-medium">"{evaluation.recommendedScript}"</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full">
          {!evaluation.isSuccess && (
            <button
              onClick={onRetry}
              className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> 다시하기
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Home className="w-5 h-5" /> 홈으로
          </button>
        </div>

      </div>
    </div>
  );
};