import type { Player } from '@hoofer-games/shared';

export type CellState = {
  owner: string | null;
  color: string | null;
  contested: boolean;
};

export type TurfWarConfig = {
  totalRounds: number;
  frenzyTime: number; // seconds per player turn
  turnsPerRound: number; // how many turns each player gets per round
};

export type TurfWarPhase =
  | 'lobby'
  | 'setup'
  | 'ready'
  | 'battle'
  | 'roundResult'
  | 'gameOver';

export type GameEnginePhase =
  | 'ready'
  | 'playing'
  | 'transitioning'
  | 'roundOver';

export type RoundScore = {
  playerId: string;
  cells: number;
  percentage: number;
  points: number;
};

export type GameState = {
  phase: TurfWarPhase;
  players: Player[];
  config: TurfWarConfig;
  currentRound: number;
  roundScores: RoundScore[][];
  totalScores: Map<string, number>;
};

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'SET_CONFIG'; config: TurfWarConfig }
  | { type: 'START_ROUND' }
  | { type: 'START_BATTLE' }
  | { type: 'END_ROUND'; scores: RoundScore[] }
  | { type: 'NEXT_ROUND' }
  | { type: 'GAME_OVER' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_PLAYERS' };
