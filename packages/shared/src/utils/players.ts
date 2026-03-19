import { Player } from '../types';
import { colors } from '../theme';

/**
 * Generate a simple unique ID for a player.
 */
export const generateId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a new player with a name and a color from the player color palette.
 */
export const createPlayer = (name: string, colorIndex: number): Player => {
  const safeIndex = Math.abs(colorIndex) % colors.playerColors.length;
  return {
    id: generateId(),
    name,
    color: colors.playerColors[safeIndex],
    score: 0,
  };
};

/**
 * Pick the next available color that no existing player is using.
 * Falls back to the first color if all are taken.
 */
export const getNextColor = (existingPlayers: Player[]): string => {
  const usedColors = new Set(existingPlayers.map((p) => p.color));
  const available = colors.playerColors.find((c) => !usedColors.has(c));
  return available ?? colors.playerColors[0];
};

/**
 * Sort players by score in descending order (highest first).
 * Ties are broken by name alphabetically.
 */
export const sortByScore = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
};
