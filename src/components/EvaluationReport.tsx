import React, { useState } from 'react';
import { RoleplayEvaluationResult, Product, DoctorType, Specialty, ScoreItem } from '../types';
import { Award, TrendingUp, TrendingDown, MessageSquareText, RefreshCw, Download, ChevronDown, ChevronUp, Star, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface EvaluationReportProps {
  evaluation: RoleplayEvaluationResult;
  product: Product;
  specialty: Specialty;
  doctorType: DoctorType;
  onRetry: () => void;
  onNewProduct: () => void;
  onExportSheets: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation, product, specialty, doctorType, onRetry, onNewProduct, onExportSheets,
}) => {
  const [showTurnDetail, setShowTurnDetail] = useState(false);
  const [showScript, setShowScript] = useState(false);

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

  const radarData = evaluation.scores.map((s: ScoreItem) => ({
    subject: s.label,
    score: s.score,
    fullMark: s.maxScore,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${product.color} text-white text-xs font-bold shadow-sm`}>
              {product.icon} {product.name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{specialty.name}</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{doctorType.name} {doctorType.title}</span>
          </div>

          {/* Grade + Score */}
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeColors[evaluation.grade] || gradeColors.C} flex items-center justify-center shadow-lg animate-pop-bounce`}>
              <span className="text-3xl font-black">{evaluation.grade}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{evaluation.totalScore}<span className="text-lg text-slate-400 font-semibold">/100</span></p>
              <p className="text-sm text-slate-500 font-semibold mt-1">{gradeLabels[evaluation.grade] || '결과를 확인하세요'}</p>
            </div>
          </div>

          {/* Doctor Mind */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{doctorType.avatar}</span>
            <div>
              <p className="text-xs font-bold text-amber-700 mb-1">💭 {doctorType.name} {doctorType.title}의 속마음</p>
              <p className="text-sm text-amber-900 font-medium leading-relaxed">"{evaluation.summary}"</p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" /> 영역별 점수
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {evaluation.scores.map((s: ScoreItem) => (
              <div key={s.key} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-600 font-semibold">{s.label}</span>
                <span className="text-xs font-extrabold text-blue-700">{s.score}/{s.maxScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> 잘한 점
            </h3>
            <ul className="space-y-2">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-rose-700 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> 보완할 점
            </h3>
            <ul className="space-y-2">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Turn-by-turn */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button onClick={() => setShowTurnDetail(!showTurnDetail)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-indigo-600" /> 턴별 상세 분석
            </h3>
            {showTurnDetail ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showTurnDetail && evaluation.turnByTurnAnalysis?.length > 0 && (
            <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-3">
              {evaluation.turnByTurnAnalysis.map((t, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Turn {t.turn}</span>
                    <span className="text-xs font-extrabold text-blue-700">{t.score}점</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium bg-white rounded-lg p-2 border border-slate-100">"{t.mrMessage}"</p>
                  <p className="text-xs text-slate-500">{t.comment}</p>
                  {t.suggestion && <p className="text-xs text-blue-600 font-semibold">💡 {t.suggestion}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Script */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <button onClick={() => setShowScript(!showScript)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> 추천 모범 스크립트
            </h3>
            {showScript ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showScript && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-900 font-medium leading-relaxed whitespace-pre-line">{evaluation.recommendedScript}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-8">
          <button onClick={onRetry}
            className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> 다시 도전
          </button>
          <button onClick={onNewProduct}
            className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" /> 다른 제품
          </button>
          <button onClick={onExportSheets}
            className="py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Google Sheets 저장
          </button>
        </div>
      </div>
    </div>
  );
};
