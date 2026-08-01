import React from 'react';
import { RoleplayEvaluationResult } from '../types';
import { RotateCcw, Home } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  onRetry: () => void;
  onClose: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation, onRetry, onClose
}) => {
  // Emojis removed

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-blue-500';
      case 'B': return 'text-orange-500';
      case 'C': return 'text-red-500';
      default: return 'text-black';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white text-black font-sans h-[100dvh] p-4 border-x-2 border-black max-w-md mx-auto">
      
      <div className="w-full pixel-box p-6 flex flex-col items-center shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-white text-center animate-slideUp">
        <h2 className="text-xl font-bold mb-6">롤플레이 결과 리포트</h2>


        <div className={`text-5xl font-black mb-2 ${getGradeColor(evaluation.grade)}`}>
          {evaluation.grade} 등급
        </div>
        
        <div className="text-lg font-bold mb-6">
          {evaluation.isSuccess ? '퀘스트 클리어 성공!' : '퀘스트 클리어 실패...'}
        </div>

        <div className="w-full text-left bg-gray-100 p-4 border-2 border-black rounded-lg mb-6 text-sm">
          <h3 className="font-bold mb-2">원장님의 코멘트</h3>
          <p className="leading-relaxed mb-4">{evaluation.reasoning}</p>

          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-blue-600">장점 (Strengths)</h4>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
            <div>
              <h4 className="font-bold text-red-600">보완점 (Weaknesses)</h4>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>

        {evaluation.recommendedScript && (
          <div className="w-full text-left bg-yellow-50 p-4 border-2 border-black rounded-lg mb-8 text-sm">
            <h3 className="font-bold mb-2">추천 스크립트</h3>
            <p className="italic leading-relaxed">{evaluation.recommendedScript}</p>
          </div>
        )}

        <div className="flex gap-4 w-full">
          {!evaluation.isSuccess && (
            <button 
              onClick={onRetry}
              className="flex-1 py-3 border-2 border-black bg-white hover:bg-gray-100 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 재도전
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 py-3 border-2 border-black bg-black text-white hover:bg-gray-800 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" /> 홈으로
          </button>
        </div>

      </div>
    </div>
  );
};