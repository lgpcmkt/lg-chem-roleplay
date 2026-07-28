// ── Product ──
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  composition: string;
  indication: string;
  tagline: string;
  color: string;         // gradient color theme
  icon: string;          // emoji icon
  imageUrl?: string;     // real product image URL
  specialties: Specialty[];
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ── Doctor Type ──
export interface DoctorType {
  id: 'strict' | 'academic' | 'friendly';
  name: string;
  title: string;
  avatar: string;
  imageUrl?: string;     // real doctor image URL
  difficulty: string;
  personality: string;
  focusArea: string;
}

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
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C';
  scores: ScoreItem[];
  summary: string;         // 의사 속마음
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
  keyChecklistStatus: Record<string, boolean>;
}

// ── Session ──
export interface SavedSession {
  id: string;
  date: string;
  productId: string;
  productName: string;
  specialtyName: string;
  doctorTypeName: string;
  evaluation: RoleplayEvaluationResult;
  chatHistory: ChatMessage[];
}

// ── Employee ──
export interface EmployeeInfo {
  employeeId: string;
  name: string;
  department: string;
}

// ── Roleplay Config (선택된 조합) ──
export interface RoleplayConfig {
  productId: string;
  specialtyId: string;
  doctorTypeId: string;
}
