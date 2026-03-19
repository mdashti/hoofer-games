import React, { useReducer, useRef, useEffect } from 'react';
import { StyleSheet, Animated, View, StatusBar } from 'react-native';
import {
  theme,
  GameShell,
  generateId,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

import { TitleScreen } from './src/screens/TitleScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { PromptScreen } from './src/screens/PromptScreen';
import { VotingScreen } from './src/screens/VotingScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { DebateScreen } from './src/screens/DebateScreen';
import { PersuasionVoteScreen } from './src/screens/PersuasionVoteScreen';
import { RoundResultScreen, RoundScore } from './src/screens/RoundResultScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { getRandomPrompts, Prompt } from './src/data/prompts';

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────

type HotTakePhase =
  | 'lobby'
  | 'setup'
  | 'prompt'
  | 'voting'
  | 'reveal'
  | 'debate'
  | 'persuasionVote'
  | 'roundResult'
  | 'gameOver';

type Vote = 'agree' | 'disagree';
type PersuasionVote = 'yes' | 'no';

type GameState = {
  phase: HotTakePhase;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentPrompt: Prompt | null;
  votes: Record<string, Vote>;
  persuasionVotes: Record<string, PersuasionVote>;
  usedPromptIds: string[];
  roundScores: RoundScore[];
  /** Cached prompts for the entire game session. */
  sessionPrompts: Prompt[];
};

// ──────────────────────────────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────────────────────────────

type Action =
  | { type: 'GO_TO_SETUP' }
  | { type: 'ADD_PLAYER'; name: string; color: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'UPDATE_PLAYER'; id: string; updates: Partial<Player> }
  | { type: 'SET_ROUNDS'; rounds: number }
  | { type: 'START_GAME' }
  | { type: 'SHOW_VOTING' }
  | { type: 'SUBMIT_VOTES'; votes: Record<string, Vote> }
  | { type: 'START_DEBATE' }
  | { type: 'START_PERSUASION' }
  | { type: 'SUBMIT_PERSUASION'; votes: Record<string, PersuasionVote> }
  | { type: 'NEXT_ROUND' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_PLAYERS' }
  | { type: 'GO_BACK_LOBBY' };

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function computeRoundScores(
  players: Player[],
  votes: Record<string, Vote>,
  persuasionVotes: Record<string, PersuasionVote>,
): RoundScore[] {
  const agreeCount = Object.values(votes).filter((v) => v === 'agree').length;
  const disagreeCount = Object.values(votes).filter((v) => v === 'disagree').length;
  const isTie = agreeCount === disagreeCount;

  if (isTie) {
    // Nobody is in the minority in a tie — everyone gets 0
    return players.map((p) => ({
      playerId: p.id,
      points: 0,
      label: 'Tied Vote -- No Minority',
      reason: 'tie',
    }));
  }

  const minorityVote: Vote = agreeCount < disagreeCount ? 'agree' : 'disagree';
  const minorityIds = new Set(
    Object.entries(votes)
      .filter(([, v]) => v === minorityVote)
      .map(([id]) => id),
  );

  // Count persuasion "yes" votes
  const yesCount = Object.values(persuasionVotes).filter((v) => v === 'yes').length;
  const noCount = Object.values(persuasionVotes).filter((v) => v === 'no').length;
  const convinced = yesCount > noCount;

  return players.map((p) => {
    if (minorityIds.has(p.id)) {
      if (convinced) {
        return {
          playerId: p.id,
          points: 3,
          label: 'Brave & Convincing!',
          reason: 'minority-convinced',
        };
      }
      return {
        playerId: p.id,
        points: 1,
        label: 'Nice Try!',
        reason: 'minority-unconvinced',
      };
    }
    return {
      playerId: p.id,
      points: 0,
      label: 'Played it Safe',
      reason: 'majority',
    };
  });
}

function applyScores(players: Player[], scores: RoundScore[]): Player[] {
  const scoreMap = new Map(scores.map((s) => [s.playerId, s.points]));
  return players.map((p) => ({
    ...p,
    score: p.score + (scoreMap.get(p.id) ?? 0),
  }));
}

// ──────────────────────────────────────────────────────────────────────
// Initial state
// ──────────────────────────────────────────────────────────────────────

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  currentRound: 1,
  totalRounds: 5,
  currentPrompt: null,
  votes: {},
  persuasionVotes: {},
  usedPromptIds: [],
  roundScores: [],
  sessionPrompts: [],
};

// ──────────────────────────────────────────────────────────────────────
// Reducer
// ──────────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return { ...state, phase: 'setup' };

    case 'ADD_PLAYER': {
      const newPlayer: Player = {
        id: generateId(),
        name: action.name,
        color: action.color,
        score: 0,
      };
      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id ? { ...p, ...action.updates } : p,
        ),
      };

    case 'SET_ROUNDS':
      return { ...state, totalRounds: action.rounds };

    case 'START_GAME': {
      // Fetch prompts for the whole session up front
      const sessionPrompts = getRandomPrompts(state.totalRounds, state.usedPromptIds);
      const firstPrompt = sessionPrompts[0] ?? null;
      return {
        ...state,
        phase: 'prompt',
        currentRound: 1,
        currentPrompt: firstPrompt,
        votes: {},
        persuasionVotes: {},
        usedPromptIds: firstPrompt
          ? [...state.usedPromptIds, firstPrompt.id]
          : state.usedPromptIds,
        roundScores: [],
        sessionPrompts,
        // Reset scores on players
        players: state.players.map((p) => ({ ...p, score: 0 })),
      };
    }

    case 'SHOW_VOTING':
      return { ...state, phase: 'voting', votes: {} };

    case 'SUBMIT_VOTES':
      return { ...state, phase: 'reveal', votes: action.votes };

    case 'START_DEBATE': {
      // If it's a tie, skip directly to scoring with no persuasion
      const agreeCount = Object.values(state.votes).filter((v) => v === 'agree').length;
      const disagreeCount = Object.values(state.votes).filter((v) => v === 'disagree').length;
      const isTie = agreeCount === disagreeCount;

      if (isTie) {
        const roundScores = computeRoundScores(state.players, state.votes, {});
        const updatedPlayers = applyScores(state.players, roundScores);
        return {
          ...state,
          phase: 'roundResult',
          persuasionVotes: {},
          roundScores,
          players: updatedPlayers,
        };
      }
      return { ...state, phase: 'debate' };
    }

    case 'START_PERSUASION':
      return { ...state, phase: 'persuasionVote', persuasionVotes: {} };

    case 'SUBMIT_PERSUASION': {
      const roundScores = computeRoundScores(
        state.players,
        state.votes,
        action.votes,
      );
      const updatedPlayers = applyScores(state.players, roundScores);
      return {
        ...state,
        phase: 'roundResult',
        persuasionVotes: action.votes,
        roundScores,
        players: updatedPlayers,
      };
    }

    case 'NEXT_ROUND': {
      if (state.currentRound >= state.totalRounds) {
        return { ...state, phase: 'gameOver' };
      }
      const nextRound = state.currentRound + 1;
      const nextPrompt = state.sessionPrompts[nextRound - 1] ?? null;
      return {
        ...state,
        phase: 'prompt',
        currentRound: nextRound,
        currentPrompt: nextPrompt,
        votes: {},
        persuasionVotes: {},
        roundScores: [],
        usedPromptIds: nextPrompt
          ? [...state.usedPromptIds, nextPrompt.id]
          : state.usedPromptIds,
      };
    }

    case 'PLAY_AGAIN': {
      // Same players, new game
      const sessionPrompts = getRandomPrompts(state.totalRounds, state.usedPromptIds);
      const firstPrompt = sessionPrompts[0] ?? null;
      return {
        ...state,
        phase: 'prompt',
        currentRound: 1,
        currentPrompt: firstPrompt,
        votes: {},
        persuasionVotes: {},
        roundScores: [],
        sessionPrompts,
        usedPromptIds: firstPrompt
          ? [...state.usedPromptIds, firstPrompt.id]
          : state.usedPromptIds,
        players: state.players.map((p) => ({ ...p, score: 0 })),
      };
    }

    case 'NEW_PLAYERS':
      return { ...initialState, phase: 'setup' };

    case 'GO_BACK_LOBBY':
      return initialState;

    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────────────────
// App Component
// ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ── Screen-transition fade ──────────────────────────────
  const screenFade = useRef(new Animated.Value(1)).current;
  const prevPhaseRef = useRef<HotTakePhase>(state.phase);

  useEffect(() => {
    if (prevPhaseRef.current !== state.phase) {
      // Quick fade-out then fade-in on phase change
      screenFade.setValue(0);
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      prevPhaseRef.current = state.phase;
    }
  }, [state.phase, screenFade]);

  // ── Derived data ────────────────────────────────────────
  const agreeCount = Object.values(state.votes).filter((v) => v === 'agree').length;
  const disagreeCount = Object.values(state.votes).filter((v) => v === 'disagree').length;
  const minorityVote: Vote =
    agreeCount <= disagreeCount ? 'agree' : 'disagree';
  const isTie = agreeCount === disagreeCount && agreeCount > 0;

  const minorityPlayers = isTie
    ? []
    : state.players.filter((p) => state.votes[p.id] === minorityVote);

  const majorityPlayers = isTie
    ? state.players
    : state.players.filter((p) => state.votes[p.id] !== minorityVote);

  // ── Render ──────────────────────────────────────────────

  const renderScreen = () => {
    switch (state.phase) {
      case 'lobby':
        return (
          <TitleScreen onNewGame={() => dispatch({ type: 'GO_TO_SETUP' })} />
        );

      case 'setup':
        return (
          <GameShell title="Game Setup" showBack onBack={() => dispatch({ type: 'GO_BACK_LOBBY' })}>
            <SetupScreen
              players={state.players}
              totalRounds={state.totalRounds}
              onAddPlayer={(name, color) =>
                dispatch({ type: 'ADD_PLAYER', name, color })
              }
              onRemovePlayer={(id) => dispatch({ type: 'REMOVE_PLAYER', id })}
              onUpdatePlayer={(id, updates) =>
                dispatch({ type: 'UPDATE_PLAYER', id, updates })
              }
              onSetRounds={(rounds) =>
                dispatch({ type: 'SET_ROUNDS', rounds })
              }
              onStart={() => dispatch({ type: 'START_GAME' })}
              onBack={() => dispatch({ type: 'GO_BACK_LOBBY' })}
            />
          </GameShell>
        );

      case 'prompt':
        return state.currentPrompt ? (
          <PromptScreen
            prompt={state.currentPrompt}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
            onReady={() => dispatch({ type: 'SHOW_VOTING' })}
          />
        ) : null;

      case 'voting':
        return state.currentPrompt ? (
          <VotingScreen
            players={state.players}
            prompt={state.currentPrompt}
            onAllVotesIn={(votes) =>
              dispatch({ type: 'SUBMIT_VOTES', votes })
            }
          />
        ) : null;

      case 'reveal':
        return state.currentPrompt ? (
          <RevealScreen
            players={state.players}
            prompt={state.currentPrompt}
            votes={state.votes}
            onStartDebate={() => dispatch({ type: 'START_DEBATE' })}
          />
        ) : null;

      case 'debate':
        return state.currentPrompt ? (
          <DebateScreen
            minorityPlayers={minorityPlayers}
            prompt={state.currentPrompt}
            onFinish={() => dispatch({ type: 'START_PERSUASION' })}
          />
        ) : null;

      case 'persuasionVote':
        return (
          <PersuasionVoteScreen
            voters={majorityPlayers}
            minorityPlayers={minorityPlayers}
            onAllVotesIn={(votes) =>
              dispatch({ type: 'SUBMIT_PERSUASION', votes })
            }
          />
        );

      case 'roundResult':
        return (
          <RoundResultScreen
            players={state.players}
            roundScores={state.roundScores}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
            isLastRound={state.currentRound >= state.totalRounds}
            onNext={() => dispatch({ type: 'NEXT_ROUND' })}
          />
        );

      case 'gameOver':
        return (
          <GameOverScreen
            players={state.players}
            onPlayAgain={() => dispatch({ type: 'PLAY_AGAIN' })}
            onNewPlayers={() => dispatch({ type: 'NEW_PLAYERS' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Animated.View style={[styles.screen, { opacity: screenFade }]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
  },
});
