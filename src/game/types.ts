export type Screen = 'home' | 'rules' | 'game' | 'result' | 'ranking';

export type EffectTuple = [
  money: number,
  growth: number,
  prod: number,
  rep: number,
  liq: number,
  risk: number,
];

export interface GameEvent {
  title: string;
  text: string;
  topic: string;
  opts: [string, string][];
  effects: EffectTuple[];
  riskyIndex: number;
}

export interface GameState {
  day: number;
  name: string;
  money: number;
  growth: number;
  prod: number;
  rep: number;
  liq: number;
  risk: number;
  sat: number;
  trust: number;
  points: number;
  questionInDay: number;
  log: string[];
  lost: boolean;
  finalScore: number;
  resultType: ResultType;
}

export type ResultType = 'victory' | 'competitive' | 'stable' | 'crisis';

export interface GlobalRecord {
  id: string;
  company_name: string;
  points: number;
  days: number;
  result_type: ResultType;
  created_at: string;
  updated_at: string;
}

export type GamePhase = 'decision';

export interface ScoreSubmission {
  status: 'idle' | 'saving' | 'saved' | 'error';
  globalPosition: number | null;
  totalRecords: number | null;
  errorMessage: string | null;
}
