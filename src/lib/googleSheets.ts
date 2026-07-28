import { RoleplayEvaluationResult, SavedSession, EmployeeInfo } from '../types';

const SPREADSHEET_TITLE = 'LG화학 MR 디테일링 성적표';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowsAdded: number;
}

async function getOrCreateSpreadsheet(accessToken: string): Promise<{ id: string; url: string; isNew: boolean }> {
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    )}`;
    const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files?.length > 0) {
        const file = searchData.files[0];
        return { id: file.id, url: `https://docs.google.com/spreadsheets/d/${file.id}`, isNew: false };
      }
    }
  } catch {}

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_TITLE },
      sheets: [{ properties: { title: '학습성적표', gridProperties: { frozenRowCount: 1 } } }],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Google Sheets 생성 실패');
  }

  const sheetData = await createRes.json();
  const id = sheetData.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${id}`;

  const headers = ['일시', '사번', '이름', '부서', '제품명', '진료과', '의사타입', '총점', '등급', '의사 속마음', '추천 모범 스크립트'];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A1:K1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [headers] }),
  });

  return { id, url, isNew: true };
}

export async function exportSingleEvaluationToSheets(
  accessToken: string,
  evaluation: RoleplayEvaluationResult,
  productName: string,
  specialtyName: string,
  doctorTypeName: string,
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  const { id, url } = await getOrCreateSpreadsheet(accessToken);
  const dateStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const row = [
    dateStr,
    employeeInfo?.employeeId || '미등록',
    employeeInfo?.name || 'MR',
    employeeInfo?.department || '영업부',
    productName,
    specialtyName,
    doctorTypeName,
    evaluation.totalScore,
    evaluation.grade,
    evaluation.summary || '',
    evaluation.recommendedScript || '',
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A:K:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] }),
    }
  );

  if (!appendRes.ok) throw new Error('데이터 추가 실패');
  return { spreadsheetId: id, spreadsheetUrl: url, rowsAdded: 1 };
}

export async function exportAllSessionsToSheets(
  accessToken: string,
  savedSessions: SavedSession[],
  employeeInfo: EmployeeInfo | null
): Promise<ExportResult> {
  if (savedSessions.length === 0) throw new Error('저장 기록 없음');

  const { id, url } = await getOrCreateSpreadsheet(accessToken);
  const rows = savedSessions.map((s) => [
    s.date,
    employeeInfo?.employeeId || '미등록',
    employeeInfo?.name || 'MR',
    employeeInfo?.department || '영업부',
    s.productName,
    s.specialtyName,
    s.doctorTypeName,
    s.evaluation.totalScore,
    s.evaluation.grade,
    s.evaluation.summary || '',
    s.evaluation.recommendedScript || '',
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/학습성적표!A:K:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    }
  );

  return { spreadsheetId: id, spreadsheetUrl: url, rowsAdded: rows.length };
}

export async function readSpreadsheetData(accessToken: string, spreadsheetId: string): Promise<string[][]> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/학습성적표!A1:K100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('데이터 읽기 실패');
  const data = await res.json();
  return data.values || [];
}
