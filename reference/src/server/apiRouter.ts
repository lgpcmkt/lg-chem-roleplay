import express from 'express';
import { DOCTOR_PERSONAS } from './doctorPersonas';
import { generateDoctorResponse, evaluateRoleplayTranscript } from './geminiService';

const router = express.Router();

// In-memory learning log storage (with initial sample data)
export interface LearningLogRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  date: string;
  summary: string;
  keyChecklistStatus: {
    switchingStudyMentioned: boolean;
    same3DrugHbA1cReductionMentioned: boolean;
    sidapviaPillSizeCompared: boolean;
    patientComplianceEmphasized: boolean;
    objectionOvercomeSuccessfully: boolean;
    closingCallToActionMade: boolean;
  };
}

const learningLogsDB: LearningLogRecord[] = [
  {
    id: 'log_101',
    employeeId: '202401',
    employeeName: '김영업',
    department: '서울1지점',
    doctorId: 'park_jin_ryo',
    doctorName: '박진료',
    doctorTitle: '과장',
    score: 88,
    grade: 'A',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    summary: 'SWITCHING 연구 결과 및 동일 3제 교체 시 HbA1c 추가 강하 설명 우수',
    keyChecklistStatus: {
      switchingStudyMentioned: true,
      same3DrugHbA1cReductionMentioned: true,
      sidapviaPillSizeCompared: true,
      patientComplianceEmphasized: true,
      objectionOvercomeSuccessfully: true,
      closingCallToActionMade: false,
    },
  },
];

// GET /api/doctors - Get all doctor personas
router.get('/doctors', (req, res) => {
  res.json(Object.values(DOCTOR_PERSONAS));
});

// POST /api/doctor-ai - Stream or get next turn doctor response
router.post('/doctor-ai', async (req, res) => {
  try {
    const { doctorId, chatHistory = [], userMessage, userName, employeeName } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const result = await generateDoctorResponse(
      doctorId || 'park_jin_ryo',
      chatHistory,
      userMessage,
      userName || employeeName
    );

    res.json(result);
  } catch (error: any) {
    console.error('API /api/doctor-ai error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message,
    });
  }
});

// POST /api/evaluate - Evaluate full roleplay transcript
router.post('/evaluate', async (req, res) => {
  try {
    const { doctorId, chatHistory = [] } = req.body;

    if (!chatHistory || chatHistory.length === 0) {
      return res.status(400).json({ error: 'chatHistory is required for evaluation' });
    }

    const result = await evaluateRoleplayTranscript(
      doctorId || 'park_jin_ryo',
      chatHistory
    );

    res.json(result);
  } catch (error: any) {
    console.error('API /api/evaluate error:', error);
    res.status(500).json({
      error: 'Failed to evaluate roleplay',
      details: error.message,
    });
  }
});

// GET /api/learning-logs - Get learning logs (optional ?employeeId=...)
router.get('/learning-logs', (req, res) => {
  const { employeeId } = req.query;
  if (employeeId && typeof employeeId === 'string') {
    const filtered = learningLogsDB.filter((log) => log.employeeId === employeeId);
    return res.json(filtered);
  }
  res.json(learningLogsDB);
});

// POST /api/learning-logs - Save new learning log by employeeId
router.post('/learning-logs', (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      doctorId,
      doctorName,
      doctorTitle,
      score,
      grade,
      summary,
      keyChecklistStatus,
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const newRecord: LearningLogRecord = {
      id: `log_${Date.now()}`,
      employeeId,
      employeeName: employeeName || '영업사원',
      department: department || '영업본부',
      doctorId,
      doctorName: doctorName || '의사',
      doctorTitle: doctorTitle || '선생님',
      score: score || 0,
      grade: grade || 'C',
      date: new Date().toISOString(),
      summary: summary || '제미다파 SWITCHING 디테일링 진행',
      keyChecklistStatus: keyChecklistStatus || {
        switchingStudyMentioned: false,
        same3DrugHbA1cReductionMentioned: false,
        sidapviaPillSizeCompared: false,
        patientComplianceEmphasized: false,
        objectionOvercomeSuccessfully: false,
        closingCallToActionMade: false,
      },
    };

    learningLogsDB.unshift(newRecord);
    res.json({ success: true, record: newRecord, allLogs: learningLogsDB.filter(l => l.employeeId === employeeId) });
  } catch (error: any) {
    console.error('Save learning log error:', error);
    res.status(500).json({ error: 'Failed to save learning log' });
  }
});

// GET /api/guidebook - Get Zemidapa product information & LG Chem field objection battlecards
router.get('/guidebook', (req, res) => {
  res.json({
    productName: '제미다파정 (Zemidapa Tab.)',
    manufacturer: 'LG화학 (LG Chem)',
    composition: '제미글립틴 50mg + 다파글리플로진 10mg (FDC 복합제)',
    dosage: '1일 1회 1정 식사와 관계없이 복용',
    keyFeatures: [
      {
        title: '신규 SWITCHING 연구 입증',
        description: '기존 met/dpp-4i, met/dpp-4i/su 및 met/dpp-4i/sglt-2i 복용 환자에서 메트포르민 + 제미다파 3제 교체 투여 시 유의한 HbA1c 추가 감소 입증',
        icon: 'Zap',
      },
      {
        title: '동일 3제 교체 시 추가 HbA1c 강하',
        description: '기존 met/dpp-4i/sglt-2i 3제를 복용하던 동일 조건 환자에서도 제미다파 3제로 교체 시 추가적인 혈당 강하 효과 확인',
        icon: 'ShieldCheck',
      },
      {
        title: '경쟁품 시다프비아 대비 현저히 작은 알약 크기',
        description: '경쟁 복합제 시다프비아 대비 알약 크기가 대폭 축소되어 환자 목넘김 향상 및 복약 순응도(Patient Compliance) 극대화',
        icon: 'Pill',
      },
      {
        title: '신장 및 심혈관 보호 이점',
        description: 'Dapagliflozin의 eGFR 보존 및 미세알부민뇨 개선, Gemigliptin의 강력한 24시간 DPP-4 억제',
        icon: 'Activity',
      },
    ],
    fieldObjections: [
      {
        id: 1,
        objection: '기존 3제(met/dpp-4i/sglt-2i) 잘 복용하는 환자를 왜 제미다파 3제로 바꿔야 하나요?',
        answerStrategy: 'SWITCHING 연구의 동일 3제 교체 시 추가 HbA1c 강하 데이터 강조',
        recommendedScript: '원장님! 이번 제미다파 SWITCHING 연구 결과, 기존 동일한 met/dpp-4i/sglt-2i 3제를 복용하시던 환자분들도 제미다파 3제로 교체했을 때 유의미한 추가 HbA1c 감소가 입증되었습니다. 조절이 아쉬운 환자분께 확실한 대안이 됩니다.',
      },
      {
        id: 2,
        objection: '경쟁품 시다프비아도 있는데 왜 굳이 제미다파인가요?',
        answerStrategy: '약제 크기(Tablet size) 차별화로 복약 순응도 강조',
        recommendedScript: '원장님, 시다프비아는 알약 크기가 다소 커서 고령 환자분들이 목넘김에 불편을 느끼시는 경우가 많습니다. 제미다파는 알약 크기가 현저히 작게 설계되어 매일 복용하는 환자분들의 순응도와 만족도가 훨씬 높습니다.',
      },
      {
        id: 3,
        objection: '교체 투여(Switching) 시 부작용이나 저혈당 위험은 없습니까?',
        answerStrategy: 'SWITCHING 연구의 우수한 내약성 및 안전성 데이터 제시',
        recommendedScript: 'SWITCHING 연구에서 제미다파 3제 교체 투여 시 저혈당이나 중대한 부작용 증가 없이 매우 안정적인 내약성을 보여주었습니다. 안심하시고 처방하셔도 좋습니다.',
      },
    ],
  });
});

export default router;
