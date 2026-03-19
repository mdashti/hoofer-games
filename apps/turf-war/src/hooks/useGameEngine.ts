import { useState, useRef, useCallback, useEffect } from 'react';
import type { Player } from '@hoofer-games/shared';
import { triggerHaptic } from '@hoofer-games/shared';
import type { CellState, TurfWarConfig, GameEnginePhase, RoundScore } from '../types';

function getGridSize(playerCount: number): { rows: number; cols: number } {
  switch (playerCount) {
    case 2:
      return { rows: 8, cols: 6 };
    case 3:
      return { rows: 9, cols: 7 };
    case 4:
    default:
      return { rows: 10, cols: 8 };
  }
}

function createEmptyGrid(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      owner: null,
      color: null,
      contested: false,
    })),
  );
}

export function useGameEngine(players: Player[], config: TurfWarConfig) {
  const { rows, cols } = getGridSize(players.length);

  const [grid, setGrid] = useState<CellState[][]>(() => createEmptyGrid(rows, cols));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(config.frenzyTime);
  const [currentTurn, setCurrentTurn] = useState(0); // total turns elapsed
  const [phase, setPhase] = useState<GameEnginePhase>('ready');
  const [transitionMessage, setTransitionMessage] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(config.frenzyTime);
  const phaseRef = useRef<GameEnginePhase>(phase);
  phaseRef.current = phase;

  const totalTurns = players.length * config.turnsPerRound;
  const turnsRemaining = totalTurns - currentTurn;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calculateScores = useCallback((): RoundScore[] => {
    const cellCounts = new Map<string, number>();
    let totalCells = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.owner && !cell.contested) {
          totalCells++;
          cellCounts.set(cell.owner, (cellCounts.get(cell.owner) || 0) + 1);
        }
      }
    }

    // If no cells claimed, use total grid size for percentage
    const denominator = totalCells > 0 ? totalCells : rows * cols;

    return players.map((player) => {
      const cells = cellCounts.get(player.id) || 0;
      const percentage = Math.round((cells / denominator) * 100);
      return {
        playerId: player.id,
        cells,
        percentage,
        points: percentage,
      };
    });
  }, [grid, players, rows, cols]);

  const advanceToNextPlayer = useCallback(() => {
    const nextTurn = currentTurn + 1;

    if (nextTurn >= totalTurns) {
      // Round is over
      stopTimer();
      setPhase('roundOver');
      phaseRef.current = 'roundOver';
      return;
    }

    const nextPlayerIndex = nextTurn % players.length;

    stopTimer();
    setPhase('transitioning');
    phaseRef.current = 'transitioning';
    setTransitionMessage(players[nextPlayerIndex].name);
    setCurrentTurn(nextTurn);
    setCurrentPlayerIndex(nextPlayerIndex);
    setTurnTimeRemaining(config.frenzyTime);
    timeLeftRef.current = config.frenzyTime;

    triggerHaptic('medium');
  }, [currentTurn, totalTurns, players, config.frenzyTime, stopTimer]);

  const startTurn = useCallback(() => {
    stopTimer();
    setPhase('playing');
    phaseRef.current = 'playing';
    setTurnTimeRemaining(config.frenzyTime);
    timeLeftRef.current = config.frenzyTime;

    triggerHaptic('heavy');

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;

      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0;
        setTurnTimeRemaining(0);
        stopTimer();
        // Use a short timeout so state updates flush before advancing
        setTimeout(() => {
          if (phaseRef.current === 'playing') {
            advanceToNextPlayer();
          }
        }, 50);
      } else {
        setTurnTimeRemaining(timeLeftRef.current);

        // Haptic tick at 3, 2, 1 seconds
        if (timeLeftRef.current <= 3) {
          triggerHaptic('light');
        }
      }
    }, 1000);
  }, [config.frenzyTime, stopTimer, advanceToNextPlayer]);

  const handleCellTap = useCallback(
    (row: number, col: number) => {
      if (phase !== 'playing') return;

      const currentPlayer = players[currentPlayerIndex];

      setGrid((prev) => {
        const cell = prev[row][col];

        // Tapping your own non-contested cell does nothing
        if (cell.owner === currentPlayer.id && !cell.contested) {
          return prev;
        }

        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));

        if (cell.owner === null) {
          // Claim empty cell
          newGrid[row][col] = {
            owner: currentPlayer.id,
            color: currentPlayer.color,
            contested: false,
          };
          triggerHaptic('light');
        } else if (cell.owner !== currentPlayer.id) {
          if (!cell.contested) {
            // First tap on opponent's cell: make it contested
            newGrid[row][col] = {
              ...cell,
              contested: true,
            };
            triggerHaptic('medium');
          } else {
            // Second tap on contested cell: claim it
            newGrid[row][col] = {
              owner: currentPlayer.id,
              color: currentPlayer.color,
              contested: false,
            };
            triggerHaptic('heavy');
          }
        } else if (cell.owner === currentPlayer.id && cell.contested) {
          // Reclaim your own contested cell
          newGrid[row][col] = {
            ...cell,
            contested: false,
          };
          triggerHaptic('light');
        }

        return newGrid;
      });
    },
    [phase, players, currentPlayerIndex],
  );

  const resetForNewRound = useCallback(() => {
    setGrid(createEmptyGrid(rows, cols));
    setCurrentPlayerIndex(0);
    setCurrentTurn(0);
    setTurnTimeRemaining(config.frenzyTime);
    timeLeftRef.current = config.frenzyTime;
    setPhase('ready');
    phaseRef.current = 'ready';
    setTransitionMessage('');
  }, [rows, cols, config.frenzyTime]);

  // Count cells per player for the real-time territory counter
  const territoryCounts = useCallback((): Map<string, number> => {
    const counts = new Map<string, number>();
    players.forEach((p) => counts.set(p.id, 0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.owner && !cell.contested) {
          counts.set(cell.owner, (counts.get(cell.owner) || 0) + 1);
        }
      }
    }

    return counts;
  }, [grid, players, rows, cols]);

  return {
    grid,
    rows,
    cols,
    currentPlayerIndex,
    turnTimeRemaining,
    turnsRemaining,
    currentTurn,
    totalTurns,
    phase,
    transitionMessage,
    handleCellTap,
    startTurn,
    calculateScores,
    resetForNewRound,
    territoryCounts,
  };
}
