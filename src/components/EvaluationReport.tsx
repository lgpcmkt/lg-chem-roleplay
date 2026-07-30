import React from 'react';
import { RoleplayEvaluationResult, Product, ChatMessage } from '../types';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  product: Product;
  onRetry: () => void;
  onClose: () => void;
  onSaveSheets?: () => void;
  chatHistory: ChatMessage[];
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation,
  product,
  onRetry,
  onClose,
  onSaveSheets,
}) => {
  const isSuccess = evaluation.isSuccess;
  const mainMessage = isSuccess 
    ? `${product.name} 처방 유도에 성공하셨습니다!` 
    : `${product.name} 처방 유도에 실패하였습니다.`;
  
  const textColor = isSuccess ? 'text-blue-600' : 'text-red-500';
  const bgColor = isSuccess ? 'bg-blue-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-blue-200' : 'border-red-200';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-extrabold text-slate-800">결과 리포트</h2>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6 animate-fadeIn">
          <h1 className={`text-2xl md:text-3xl font-black ${textColor}`}>
            {mainMessage}
          </h1>

          <div className="flex justify-center items-end gap-2 pb-2">
            <span className={`text-5xl font-black ${textColor}`}>{evaluation.totalScore || 0}</span>
            <span className="text-2xl font-bold text-slate-400 mb-1">/ 100</span>
          </div>
          
          <div className={`text-left p-5 rounded-2xl border ${bgColor} ${borderColor} shadow-inner`}>
            <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
              <span className="font-bold text-slate-900 block mb-2">
                {isSuccess ? "선생님의 처방변경 이유:" : "선생님의 Unmet needs:"}
              </span>
              {evaluation.reasoning}
            </p>
          </div>

          {(evaluation.strengths && evaluation.strengths.length > 0) && (
            <div className="text-left bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2">💡 잘 설명된 부분</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-700 font-medium">
                {evaluation.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
          )}

          {(evaluation.weaknesses && evaluation.weaknesses.length > 0) && (
            <div className="text-left bg-orange-50 rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-2">⚠️ 다소 아쉬웠던 부분</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-orange-700 font-medium">
                {evaluation.weaknesses.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
          )}
          {(evaluation.recommendedScript && evaluation.recommendedScript.trim().length > 0) && (
            <div className="text-left bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">🗣️ 추천 스크립트</h3>
              <p className="text-sm text-blue-700 font-medium whitespace-pre-wrap leading-relaxed">
                {evaluation.recommendedScript}
              </p>
            </div>
          )}

          <div className="pt-6 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                다시 도전
              </button>
              <button
                onClick={onClose}
                className={`flex-1 py-3.5 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${isSuccess ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}
              >
                다른 상황 선택
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};