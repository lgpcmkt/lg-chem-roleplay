export interface DoctorPersona {
  id: string;
  name: string;
  title: string;
  hospital: string;
  age: string;
  avatar: string;
  difficulty?: string;
  personality: string;
  focusArea: string;
  initialMessage: string;
  systemPrompt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

export interface RoleplayEvaluationResult {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  scores: {
    switchingStudyScore: number;
    same3DrugSwitchScore: number;
    competitorSizeScore: number;
    closingScore: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  turnByTurnAnalysis: {
    turn: number;
    mrMessage: string;
    score: number;
    comment: string;
    suggestion: string;
  }[];
  recommendedScript: string;
  keyChecklistStatus: {
    switchingStudyMentioned: boolean;
    same3DrugHbA1cReductionMentioned: boolean;
    sidapviaPillSizeCompared: boolean;
    patientComplianceEmphasized: boolean;
    objectionOvercomeSuccessfully: boolean;
    closingCallToActionMade: boolean;
  };
}

export interface SavedSession {
  id: string;
  date: string;
  doctorName: string;
  doctorTitle: string;
  hospital: string;
  evaluation: RoleplayEvaluationResult;
  chatHistory: ChatMessage[];
}

export interface ObjectionBattlecard {
  id: number;
  objection: string;
  answerStrategy: string;
  recommendedScript: string;
}

export interface FieldScenario {
  id: string;
  title: string;
  patientProfile: string;
  doctorId: string;
  mission: string;
  keyObjection: string;
  recommendedFocus: string[];
}
