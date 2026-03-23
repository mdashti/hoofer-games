import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Player } from '@hoofer-games/shared';
import type { TurfWarPhase, TurfWarConfig, RoundScore } from './src/types';

import { TitleScreen } from './src/screens/TitleScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { ReadyScreen } from './src/screens/ReadyScreen';
import { BattleScreen } from './src/screens/BattleScreen';
import { RoundResultScreen } from './src/screens/RoundResultScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';

// ── State ──────────────────────────────────────────────────

type State = {
  phase: TurfWarPhase;
  players: Player[];
  config: TurfWarConfig;
  currentRound: number;
  roundScores: RoundScore[][];
};

type Action =
  | { type: 'GO_TO_SETUP' }
  | { type: 'START_GAME'; players: Player[]; config: TurfWarConfig }
  | { type: 'START_BATTLE' }
  | { type: 'END_ROUND'; scores: RoundScore[] }
  | { type: 'NEXT_ROUND' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_PLAYERS' };

const DEFAULT_CONFIG: TurfWarConfig = {
  totalRounds: 3,
  frenzyTime: 5,
  turnsPerRound: 3,
};

function initialState(): State {
  return {
    phase: 'lobby',
    players: [],
    config: DEFAULT_CONFIG,
    currentRound: 1,
    roundScores: [],
  };
}

function applyRoundScores(players: Player[], allScores: RoundScore[][]): Player[] {
  const totals = new Map<string, number>();
  players.forEach((p) => totals.set(p.id, 0));

  for (const round of allScores) {
    for (const score of round) {
      totals.set(score.playerId, (totals.get(score.playerId) || 0) + score.points);
    }
  }

  return players.map((p) => ({ ...p, score: totals.get(p.id) || 0 }));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return { ...state, phase: 'setup' };

    case 'START_GAME':
      return {
        ...state,
        phase: 'ready',
        players: action.players.map((p) => ({ ...p, score: 0 })),
        config: action.config,
        currentRound: 1,
        roundScores: [],
      };

    case 'START_BATTLE':
      return { ...state, phase: 'battle' };

    case 'END_ROUND': {
      const newRoundScores = [...state.roundScores, action.scores];
      const updatedPlayers = applyRoundScores(state.players, newRoundScores);
      const isLastRound = state.currentRound >= state.config.totalRounds;

      return {
        ...state,
        phase: isLastRound ? 'gameOver' : 'roundResult',
        roundScores: newRoundScores,
        players: updatedPlayers,
      };
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'ready',
        currentRound: state.currentRound + 1,
      };

    case 'PLAY_AGAIN':
      return {
        ...state,
        phase: 'ready',
        players: state.players.map((p) => ({ ...p, score: 0 })),
        currentRound: 1,
        roundScores: [],
      };

    case 'NEW_PLAYERS':
      return initialState();

    default:
      return state;
  }
}

// ── App ────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const screenFade = useRef(new Animated.Value(1)).current;

  const transition = useCallback(
    (action: Action) => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        dispatch(action);
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    },
    [screenFade],
  );

  const renderScreen = () => {
    switch (state.phase) {
      case 'lobby':
        return (
          <TitleScreen onStartGame={() => transition({ type: 'GO_TO_SETUP' })} />
        );

      case 'setup':
        return (
          <SetupScreen
            onStart={(players, config) =>
              transition({ type: 'START_GAME', players, config })
            }
            onBack={() => transition({ type: 'NEW_PLAYERS' })}
          />
        );

      case 'ready':
        return (
          <ReadyScreen
            round={state.currentRound}
            totalRounds={state.config.totalRounds}
            onReady={() => dispatch({ type: 'START_BATTLE' })}
          />
        );

      case 'battle':
        return (
          <BattleScreen
            players={state.players}
            config={state.config}
            round={state.currentRound}
            onRoundEnd={(scores) => dispatch({ type: 'END_ROUND', scores })}
          />
        );

      case 'roundResult': {
        const latestScores = state.roundScores[state.roundScores.length - 1];
        return (
          <RoundResultScreen
            players={state.players}
            scores={latestScores}
            round={state.currentRound}
            totalRounds={state.config.totalRounds}
            onNext={() => transition({ type: 'NEXT_ROUND' })}
          />
        );
      }

      case 'gameOver':
        return (
          <GameOverScreen
            players={state.players}
            onPlayAgain={() => transition({ type: 'PLAY_AGAIN' })}
            onNewPlayers={() => transition({ type: 'NEW_PLAYERS' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <StatusBar style="dark" />
      {renderScreen()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
  },
});
