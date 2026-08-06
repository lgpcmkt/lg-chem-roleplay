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
  product: 'zemiglo' | 'zemimet' | 'zemidapa';
  scenarioId: string;
  scenarioTitle: string;
  evaluation?: RoleplayEvaluationResult;
  chatHistory: ChatMessage[];
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  track: string;
  scenario_id: string;
  grade: string;
  evaluation_data: RoleplayEvaluationResult;
  timestamp: string;
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
  product: 'zemiglo' | 'zemimet' | 'zemidapa';
  title: string;
  firstMessage: string;
  hint: string;
  mission: string;
  recommendedDetail: string;
}

export interface UserProgress {
  zemiglo: number;
  zemimet: number;
  zemidapa: number;
  totalPlays?: number;
  clearedScenarios?: string[];
}
