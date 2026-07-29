import React from 'react';
import { RoleplayEvaluationResult, ProductData, ChatMessage } from '../types';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  product: ProductData;
  onRetry: () => void;
  onClose: () => void;
  chatHistory: ChatMessage[];
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation,
  product,
  onRetry,
  onClose,
}) => {
  const isSuccess = evaluation.isSuccess;
  const mainMessage = isSuccess 
    ? \ 처방 유도에 성공하셨습니다! 
    : \ 처방 유도에 실패하였습니다.;
  
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
          <h1 className={	ext-2xl md:text-3xl font-black \}>
            {mainMessage}
          </h1>
          
          <div className={	ext-left p-5 rounded-2xl border \ \ shadow-inner}>
            <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
              {evaluation.reasoning}
            </p>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              다시 도전
            </button>
            <button
              onClick={onClose}
              className={lex-1 py-3.5 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg \}
            >
              다른 상황 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};