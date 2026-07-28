import React from 'react';
import { RoleplayEvaluationResult, DoctorPersona } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  Save, 
  TrendingUp, 
  BookOpen, 
  MessageSquare,
  Target
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { FileSpreadsheet } from 'lucide-react';

interface EvaluationReportModalProps {
  evaluation: RoleplayEvaluationResult;
  doctor: DoctorPersona;
  onRetry: () => void;
  onSaveToGradebook: () => void;
  onExportToGoogleSheets?: () => void;
  isSaved?: boolean;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({
  evaluation,
  doctor,
  onRetry,
  onSaveToGradebook,
  onExportToGoogleSheets,
  isSaved = false,
}) => {
  const scores = evaluation.scores || {
    switchingStudyScore: 25,
    same3DrugSwitchScore: 25,
    competitorSizeScore: 18,
    closingScore: 16,
  };

  const radarData = [
    {
      subject: 'SWITCHING 연구',
      score: Math.round(((scores.switchingStudyScore || 25) / 30) * 100),
      fullMark: 100,
    },
    {
      subject: '동일 3제 교체 강하',
      score: Math.round(((scores.same3DrugSwitchScore || 25) / 30) * 100),
      fullMark: 100,
    },
    {
      subject: '알약 크기 장점',
      score: Math.round(((scores.competitorSizeScore || 18) / 20) * 100),
      fullMark: 100,
    },
    {
      subject: '클로징 & 대응',
      score: Math.round(((scores.closingScore || 16) / 20) * 100),
      fullMark: 100,
    },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S':
        return 'bg-amber-500 text-white border-amber-400';
      case 'A':
        return 'bg-[#3182F6] text-white border-blue-400';
      case 'B':
        return 'bg-emerald-600 text-white border-emerald-400';
      case 'C':
      default:
        return 'bg-rose-600 text-white border-rose-500';
    }
  };

  const isSuccess = (evaluation.totalScore || 0) >= 70;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Main Result Outcome Banner */}
        <div className={`rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-4 border ${
          isSuccess 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-500' 
            : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div className="space-y-1">
              <span className="inline-block bg-white/20 text-white font-extrabold text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {doctor.name} {doctor.title} ({doctor.hospital})
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {isSuccess ? '🎉 제미다파 처방 유도에 성공하셨습니다!' : '💡 원장님이 처방을 신중히 검토 중입니다'}
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm shrink-0 border border-white/20">
              <div className="text-right">
                <span className="text-[11px] text-white/80 block font-bold">롤플레이 점수</span>
                <span className="text-3xl font-black">{evaluation.totalScore}<span className="text-sm font-normal">점</span></span>
              </div>
              <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl shadow-md ${getGradeColor(evaluation.grade)}`}>
                {evaluation.grade}
              </div>
            </div>
          </div>

          <div className="text-sm font-semibold leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/10">
            <span className="font-bold text-amber-300">💬 원장님의 속마음: </span>
            "{evaluation.summary}"
          </div>
        </div>

        {/* Strengths & Weaknesses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/80 rounded-3xl p-5 border border-emerald-100 space-y-2.5">
            <h3 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>잘한 디테일링 포인트</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-800 font-semibold">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-100 space-y-2.5">
            <h3 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-amber-600" />
              <span>보완하면 좋은 부분</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-800 font-semibold">
              {evaluation.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-100 shadow-sm">
                  <span className="font-bold text-amber-600">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Best Pitch */}
        {evaluation.recommendedScript && (
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-2 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[#3182F6] font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>추천 모범 디테일링 한마디</span>
            </div>
            <p className="text-xs text-slate-200 font-semibold bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 leading-relaxed">
              "{evaluation.recommendedScript}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          {onExportToGoogleSheets && (
            <button
              onClick={onExportToGoogleSheets}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets로 저장</span>
            </button>
          )}

          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </button>

          <button
            onClick={onSaveToGradebook}
            disabled={isSaved}
            className={`w-full sm:w-auto px-7 py-3.5 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-blue-500/20'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isSaved ? '성적표 저장 완료 ✓' : '성적표에 등록하기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
