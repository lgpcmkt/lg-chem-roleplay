import { RoleplayEvaluationResult, DoctorPersona, SavedSession } from '../types';
import { EmployeeInfo } from '../components/EmployeeLoginModal';

const SPREADSHEET_TITLE = '제미다파 MR 디테일링 성적표 (Google Sheets)';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowsAdded: number;
}

/**
 * Find existing spreadsheet or create a new one in Google Drive
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<{ id: string; url: string; isNew: boolean }> {
  // 1. Search Google Drive for existing sheet with SPREADSHEET_TITLE
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    )}`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const file = searchData.files[0];
        return {
          id: file.id,
          url: `https://docs.google.com/spreadsheets/d/${file.id}`,
          isNew: false,
        };
      }
    }
  } catch (err) {
    console.warn('Google Drive search failed, creating new sheet:', err);
  }

  // 2. Create new Google Spreadsheet if not found
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: '학습성적표',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Google Sheets 생성에 실패했습니다.');
  }

  const sheetData = await createRes.json();
  const id = sheetData.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${id}`;

  // Add Header Row
  const headers = [
    '일시',
    '사번',
    '이름',
    '부서',
    '의사 성함',
    '직책',
    '병원',
    '총점',
    '등급',
    'SWITCHING 연구 점수',
    '동일 3제 교체 점수',
    '알약 크기 점수',
    '클로징 점수',
    '원장 속마음',
    '추천 모범 스크립트',
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A1:O1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [headers],
    }),
  });

  return { id, url, isNew: true };
}

/**
 * Export single evaluation result to Google Sheets
 */
export async function exportSingleEvaluationToSheets(
  accessToken: string,
  evaluation: RoleplayEvaluationResult,
  doctor: DoctorPersona,
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  const { id, url } = await getOrCreateSpreadsheet(accessToken);

  const dateStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const row = [
    dateStr,
    employeeInfo?.employeeId || '미등록',
    employeeInfo?.name || 'MR',
    employeeInfo?.department || '영업부',
    doctor.name,
    doctor.title,
    doctor.hospital,
    evaluation.totalScore,
    evaluation.grade,
    evaluation.scores?.switchingStudyScore || 0,
    evaluation.scores?.same3DrugSwitchScore || 0,
    evaluation.scores?.competitorSizeScore || 0,
    evaluation.scores?.closingScore || 0,
    evaluation.summary || '',
    evaluation.recommendedScript || '',
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A:O:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json();
    throw new Error(err.error?.message || 'Google Sheets 데이터 추가에 실패했습니다.');
  }

  return { spreadsheetId: id, spreadsheetUrl: url, rowsAdded: 1 };
}

/**
 * Export all saved sessions to Google Sheets in bulk
 */
export async function exportAllSessionsToSheets(
  accessToken: string,
  savedSessions: SavedSession[],
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  if (savedSessions.length === 0) {
    throw new Error('내보낼 저장 기록이 없습니다.');
  }

  const { id, url } = await getOrCreateSpreadsheet(accessToken);

  const rows = savedSessions.map((session) => [
    session.date || new Date().toLocaleString('ko-KR'),
    employeeInfo?.employeeId || '미등록',
    employeeInfo?.name || 'MR',
    employeeInfo?.department || '영업부',
    session.doctorName,
    session.doctorTitle,
    session.hospital,
    session.evaluation.totalScore,
    session.evaluation.grade,
    session.evaluation.scores?.switchingStudyScore || 0,
    session.evaluation.scores?.same3DrugSwitchScore || 0,
    session.evaluation.scores?.competitorSizeScore || 0,
    session.evaluation.scores?.closingScore || 0,
    session.evaluation.summary || '',
    session.evaluation.recommendedScript || '',
  ]);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A:O:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json();
    throw new Error(err.error?.message || 'Google Sheets 일괄 내보내기에 실패했습니다.');
  }

  return { spreadsheetId: id, spreadsheetUrl: url, rowsAdded: rows.length };
}

/**
 * Read data from the Google Sheet
 */
export async function readSpreadsheetData(accessToken: string, spreadsheetId: string): Promise<string[][]> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/학습성적표!A1:O100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Google Sheets 데이터 읽기에 실패했습니다.');
  }

  const data = await res.json();
  return data.values || [];
}
