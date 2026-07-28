import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, initAuth, googleSignOut, getAccessToken } from '../lib/googleAuth';
import {
  exportSingleEvaluationToSheets,
  exportAllSessionsToSheets,
  readSpreadsheetData,
  ExportResult,
} from '../lib/googleSheets';
import { RoleplayEvaluationResult, DoctorPersona, SavedSession } from '../types';
import { EmployeeInfo } from './EmployeeLoginModal';
import {
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  X,
  LogOut,
  RefreshCw,
  Sparkles,
  Download,
  Database,
  Table,
} from 'lucide-react';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationToExport?: {
    evaluation: RoleplayEvaluationResult;
    doctor: DoctorPersona;
  };
  savedSessionsToExport?: SavedSession[];
  employeeInfo: EmployeeInfo | null;
}

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsIntegrationModalProps> = ({
  isOpen,
  onClose,
  evaluationToExport,
  savedSessionsToExport,
  employeeInfo,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (u, token) => {
          setUser(u);
          setAccessToken(token);
        },
        () => {
          setUser(null);
          setAccessToken(null);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setAccessToken(null);
    setExportResult(null);
    setSheetRows([]);
  };

  const handleExportSingle = async () => {
    if (!evaluationToExport) return;
    const token = accessToken || getAccessToken();
    if (!token) {
      setErrorMessage('Google 계정 로그인이 필요합니다.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    try {
      const result = await exportSingleEvaluationToSheets(
        token,
        evaluationToExport.evaluation,
        evaluationToExport.doctor,
        employeeInfo
      );
      setExportResult(result);
      await loadSheetPreview(token, result.spreadsheetId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sheets 내보내기 실패');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (!savedSessionsToExport || savedSessionsToExport.length === 0) return;
    const token = accessToken || getAccessToken();
    if (!token) {
      setErrorMessage('Google 계정 로그인이 필요합니다.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    try {
      const result = await exportAllSessionsToSheets(token, savedSessionsToExport, employeeInfo);
      setExportResult(result);
      await loadSheetPreview(token, result.spreadsheetId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sheets 내보내기 실패');
    } finally {
      setIsExporting(false);
    }
  };

  const loadSheetPreview = async (token: string, spreadsheetId: string) => {
    setIsLoadingRows(true);
    try {
      const rows = await readSpreadsheetData(token, spreadsheetId);
      setSheetRows(rows);
    } catch (err) {
      console.warn('Load sheet preview error:', err);
    } finally {
      setIsLoadingRows(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Google Sheets 연동 & 성적표 저장</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Official API
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                내 Google Drive에 구글 스프레드시트 형태로 학습 결과를 연동합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          
          {/* Auth Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            {user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Google Account'} className="w-10 h-10 rounded-full border border-emerald-300" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      {user.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{user.displayName || 'Google 사용자'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.2 rounded-full font-bold">연동 완료</span>
                    </div>
                    <span className="text-xs text-slate-500 block">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center sm:text-left">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google 계정으로 연동하세요</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    버튼을 눌러 내 구글 계정에 로그인하면 구글 드라이브 내 스프레드시트로 성적표를 전송할 수 있습니다.
                  </p>
                </div>

                <div className="flex justify-center sm:justify-start">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoggingIn}
                    className="inline-flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm transition-all disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isLoggingIn ? '구글 연결 중...' : 'Google 계정으로 로그인'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Export Action Card */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets로 내보내기 항목</span>
              </h3>
              {employeeInfo && (
                <span className="text-[11px] text-emerald-800 font-semibold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  사번: {employeeInfo.employeeId} ({employeeInfo.name})
                </span>
              )}
            </div>

            {evaluationToExport && (
              <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    현재 시뮬레이션 성적표 ({evaluationToExport.doctor.name} {evaluationToExport.doctor.title})
                  </span>
                  <span className="text-xs font-black text-[#3182F6]">
                    {evaluationToExport.evaluation.totalScore}점 ({evaluationToExport.evaluation.grade}등급)
                  </span>
                </div>
                <button
                  onClick={handleExportSingle}
                  disabled={!user || isExporting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isExporting ? '구글 시트 생성/저장 중...' : '현재 성적표 Google Sheets에 1클릭 내보내기'}</span>
                </button>
              </div>
            )}

            {savedSessionsToExport && savedSessionsToExport.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    누적 학습 DB 이력 전체 ({savedSessionsToExport.length}건)
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    평균 {Math.round(savedSessionsToExport.reduce((a, b) => a + b.evaluation.totalScore, 0) / savedSessionsToExport.length)}점
                  </span>
                </div>
                <button
                  onClick={handleExportAll}
                  disabled={!user || isExporting}
                  className="w-full py-3 bg-[#3182F6] hover:bg-[#1B64DA] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  <span>{isExporting ? '구글 시트로 일괄 저장 중...' : `전체 성적표 DB (${savedSessionsToExport.length}건) Google Sheets에 일괄 저장`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Success Result */}
          {exportResult && (
            <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Google Sheets 저장이 성공적으로 완료되었습니다!</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                '제미다파 MR 디테일링 성적표' 파일에 {exportResult.rowsAdded}건의 데이터가 구글 스프레드시트로 동기화되었습니다.
              </p>
              <div className="pt-1">
                <a
                  href={exportResult.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 font-black text-xs rounded-xl hover:bg-emerald-50 transition-all shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Google Sheets에서 바로 보기</span>
                </a>
              </div>
            </div>
          )}

          {/* Live Preview Table if rows loaded */}
          {sheetRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheet 실시간 데이터 미리보기</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">총 {sheetRows.length - 1}개 행</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-48">
                <table className="w-full text-left text-[11px] text-slate-700">
                  <thead className="bg-slate-100 font-bold text-slate-900 border-b border-slate-200 sticky top-0">
                    <tr>
                      {sheetRows[0]?.slice(0, 8).map((col, idx) => (
                        <th key={idx} className="p-2.5 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {sheetRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.slice(0, 8).map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
