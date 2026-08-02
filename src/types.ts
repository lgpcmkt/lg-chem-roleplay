// ── Chat ──
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ── Evaluation ──
export interface ScoreItem {
  key: string;
  label: string;
  score: number;
  maxScore: number;
}

export interface RoleplayEvaluationResult {
  isSuccess: boolean;
  reasoning: string;
  totalScore?: number;
  grade?: 'S' | 'A' | 'B' | 'C';
  scores?: ScoreItem[];
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedFeedback?: string;
  turnByTurnAnalysis?: {
    turn: number;
    mrMessage: string;
    score: number;
    comment: string;
    suggestion: string;
  }[];
  recommendedScript?: string;
  keyChecklistStatus?: Record<string, boolean>;
}

// ── Session ──
export interface SavedSession {
  id: string;
  date: string;
  track: 'hospital' | 'local';
  scenarioId: string;
  scenarioTitle: string;
  evaluation?: RoleplayEvaluationResult;
  chatHistory: ChatMessage[];
}

// ── Employee ──
export interface EmployeeInfo {
  employeeId: string;
  name: string;
  department: string;
}

// ── Scenario ──
export interface Scenario {
  id: string;
  track: 'hospital' | 'local';
  title: string;
  firstMessage: string;
  hint: string;
  mission: string;
  recommendedDetail: string;
}

export interface UserProgress {
  hospital: number;
  local: number;
  totalPlays?: number;
}
