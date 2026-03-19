export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
  avatar?: string;
};

export type GamePhase = 'lobby' | 'setup' | 'playing' | 'roundEnd' | 'gameOver';

export type GameConfig = {
  minPlayers: number;
  maxPlayers: number;
  roundDuration?: number;
  totalRounds: number;
};
