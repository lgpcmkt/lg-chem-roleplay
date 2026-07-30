import React, { useState } from 'react';
import { X, FileSpreadsheet, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { exportSingleEvaluationToSheets, exportAllSessionsToSheets, ExportResult } from '../lib/googleSheets';
import { RoleplayEvaluationResult, SavedSession, EmployeeInfo } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: RoleplayEvaluationResult | null;
  productName: string;
  specialtyName: string;
  doctorTypeName: string;
  employeeInfo: EmployeeInfo | null;
  savedSessions?: SavedSession[];
  mode?: 'single' | 'bulk';
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen, onClose, evaluation, productName, specialtyName, doctorTypeName,
  employeeInfo, savedSessions = [], mode = 'single',
}) => {
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<ExportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setStatus('exporting');

      let exportResult: ExportResult;
      if (mode === 'bulk' && savedSessions.length > 0) {
        exportResult = await exportAllSessionsToSheets(savedSessions, employeeInfo);
      } else if (evaluation) {
        exportResult = await exportSingleEvaluationToSheets(
          evaluation, productName, specialtyName, doctorTypeName, employeeInfo
        );
      } else {
        throw new Error('내보낼 데이터 없음');
      }

      setResult(exportResult);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '내보내기 실패');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Google Sheets 저장
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">
              {mode === 'bulk'
                ? `${savedSessions.length}건의 디테일링 기록을 Google Sheets에 저장합니다.`
                : '이번 디테일링 결과를 Google Sheets에 저장합니다.'}
            </p>
            <button onClick={handleExport}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all">
              Google 계정으로 내보내기
            </button>
          </div>
        )}

        {(status === 'exporting') && (
          <div className="flex flex-col items-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-slate-600 font-medium">
              데이터 저장 중...
            </p>
          </div>
        )}

        {status === 'success' && result && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">저장 완료! ✨</p>
              <p className="text-xs text-slate-500 mt-1">{result.rowsAdded}건이 시트에 안전하게 기록되었습니다.</p>
            </div>
            <button onClick={onClose}
              className="inline-flex items-center justify-center w-full py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors mt-2">
              닫기
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-rose-600 font-semibold">⚠️ {errorMsg}</p>
            <button onClick={() => setStatus('idle')}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
