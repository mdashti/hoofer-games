// Theme
export { theme, colors, spacing, borderRadius, fontSize, fontWeight, shadow } from './theme';

// Types
export type { Player, GamePhase, GameConfig } from './types';

// Components
export { HooferButton } from './components/HooferButton';
export { PlayerSetup } from './components/PlayerSetup';
export { ScoreBoard } from './components/ScoreBoard';
export { Timer } from './components/Timer';
export { GameShell } from './components/GameShell';

// Utils
export { triggerHaptic } from './utils/haptics';
export { createPlayer, getNextColor, sortByScore, generateId } from './utils/players';
