import { RoleplayEvaluationResult, SavedSession, EmployeeInfo } from '../types';

export interface ExportResult {
  success: boolean;
  rowsAdded: number;
}

// ⚠️ 고객이 발급받은 Apps Script 웹앱 URL을 여기에 붙여넣어 주세요. (추후 .env로 빼셔도 됩니다)
// ⚠️ 고객이 발급받은 Apps Script 웹앱 URL을 여기에 붙여넣어 주세요. (추후 .env로 빼셔도 됩니다)
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz8fpsBhIIFZA3qoOc9ewXieSiLu89Q5g8Lzt64OdRzFTLS1VGAFCsR-cwe9JNAEgEq/exec';

export async function exportSingleEvaluationToSheets(
  evaluation: RoleplayEvaluationResult,
  productName: string,
  specialtyName: string,
  doctorTypeName: string,
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('구글 Apps Script URL이 설정되지 않았습니다.');
  }

  const dateStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const payload = {
    date: dateStr,
    employeeId: employeeInfo?.employeeId || '미등록',
    name: employeeInfo?.name || 'MR',
    department: employeeInfo?.department || '영업부',
    productName,
    specialtyName,
    doctorTypeName,
    totalScore: evaluation.totalScore || 0,
    grade: evaluation.grade || 'C',
    summary: evaluation.summary || '',
    recommendedScript: evaluation.recommendedScript || '',
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // CORS 우회를 위해 no-cors 사용 (단, 응답 바디는 읽을 수 없음)
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // JSON 통신 시 preflight 에러 방지
      },
      body: JSON.stringify(payload),
    });
    
    // no-cors 모드에서는 response.ok 등을 확인할 수 없으므로 성공으로 간주
    return { success: true, rowsAdded: 1 };
  } catch (error: any) {
    throw new Error('시트 저장 중 오류가 발생했습니다: ' + error.message);
  }
}

export async function exportAllSessionsToSheets(
  savedSessions: SavedSession[],
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('구글 Apps Script URL이 설정되지 않았습니다.');
  }
  if (savedSessions.length === 0) throw new Error('저장 기록 없음');

  try {
    // 여러 건을 각각 전송하거나, Apps Script에서 배열 처리를 지원하도록 수정 가능.
    // 여기서는 간단히 개별 전송 후 성공으로 간주
    for (const s of savedSessions) {
      const payload = {
        date: s.date,
        employeeId: employeeInfo?.employeeId || '미등록',
        name: employeeInfo?.name || 'MR',
        department: employeeInfo?.department || '영업부',
        productName: s.productName,
        specialtyName: s.specialtyName,
        doctorTypeName: s.doctorTypeName,
        totalScore: s.evaluation?.totalScore || 0,
        grade: s.evaluation?.grade || '',
        summary: s.evaluation?.summary || '',
        recommendedScript: s.evaluation?.recommendedScript || '',
      };

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
    }

    return { success: true, rowsAdded: savedSessions.length };
  } catch (error: any) {
    throw new Error('시트 일괄 저장 중 오류가 발생했습니다: ' + error.message);
  }
}

