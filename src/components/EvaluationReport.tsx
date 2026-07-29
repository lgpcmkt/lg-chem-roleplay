import React from 'react';
import { RoleplayEvaluationResult, Product, DoctorType, Specialty } from '../types';
import { Award, RefreshCw, ArrowRight, MessageSquareQuote } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  product: Product;
  specialty: Specialty;
  doctorType: DoctorType;
  onRetry: () => void;
  onNewProduct: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation, product, doctorType, onRetry, onNewProduct,
}) => {
  const gradeColors: Record<string, string> = {
    S: 'from-amber-400 to-yellow-500 text-white',
    A: 'from-blue-500 to-indigo-600 text-white',
    B: 'from-emerald-500 to-teal-600 text-white',
    C: 'from-slate-400 to-slate-500 text-white',
  };

  const gradeLabels: Record<string, string> = {
    S: '완벽한 디테일링! 🎉',
    A: '우수한 디테일링 👍',
    B: '보통 수준 📝',
    C: '분발이 필요해요 💪',
  };

  // Combine strengths and weaknesses into a simple bullet list for the UI
  const feedbackBullets = [...evaluation.strengths, ...evaluation.weaknesses].filter(Boolean).slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${product.color} text-white text-xs font-bold shadow-sm`}>
              {product.icon} {product.name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{doctorType.name}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeColors[evaluation.grade] || gradeColors.C} flex items-center justify-center shadow-lg animate-pop-bounce`}>
              <span className="text-3xl font-black">{evaluation.grade}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{evaluation.totalScore}<span className="text-lg text-slate-400 font-semibold">/100</span></p>
              <p className="text-sm text-slate-500 font-semibold mt-1">{gradeLabels[evaluation.grade] || '결과를 확인하세요'}</p>
            </div>
          </div>
        </div>

        {/* Simple Feedback Bullets */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-blue-600" /> 총평 피드백
          </h3>
          <ul className="space-y-3">
            {feedbackBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium leading-relaxed">
                <span className="text-blue-500 font-bold">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Script */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> 추천 모범 스크립트
          </h3>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm text-blue-900 font-medium leading-relaxed whitespace-pre-line">
              {evaluation.recommendedScript || '제공된 모범 스크립트가 없습니다.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
          <button onClick={onRetry}
            className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> 다시 도전
          </button>
          <button onClick={onNewProduct}
            className="py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" /> 다른 제품
          </button>
        </div>
      </div>
    </div>
  );
};
