export type GameMode = 'classic' | 'combo' | 'betrayal' | 'kid';

export type AnswerMode = 'correct' | 'wrong';

export type MaybeOppositeConfig = {
  gameMode: GameMode;
  questionsPerPlayer: number;
  totalRounds: number;
  timerDuration: number;
};

export type QuestionResult = {
  playerId: string;
  questionId: string;
  mode: AnswerMode;
  gotItRight: boolean;
  timeExpired: boolean;
};

export type ComboState = {
  currentStreak: number;
  bestStreak: number;
  speed: number;
  totalAnswered: number;
};

export type BetrayalRound = {
  spyId: string;
  questionId: string;
  votes: Record<string, string>;
  spyCaught: boolean;
};

export type ClassicPhase =
  | 'getReady'
  | 'question'
  | 'judgment'
  | 'quickResult';

export type BetrayalPhase =
  | 'roleReveal'
  | 'question'
  | 'voting'
  | 'spyReveal';

export type AppPhase =
  | 'title'
  | 'modeSelect'
  | 'setup'
  | 'playing'
  | 'roundResult'
  | 'gameOver';
