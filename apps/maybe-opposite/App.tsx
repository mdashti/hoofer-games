import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { theme } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { AppPhase, GameMode, MaybeOppositeConfig } from './src/types';
import { TitleScreen } from './src/screens/TitleScreen';
import { ModeSelectScreen } from './src/screens/ModeSelectScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { ClassicGameScreen } from './src/screens/ClassicGameScreen';
import { ComboGameScreen } from './src/screens/ComboGameScreen';
import { BetrayalGameScreen } from './src/screens/BetrayalGameScreen';
import { RoundResultScreen } from './src/screens/RoundResultScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';

type GameState = {
  phase: AppPhase;
  gameMode: GameMode | null;
  config: MaybeOppositeConfig | null;
  players: Player[];
  finalPlayers: Player[];
  bestStreak: number;
};

type GameAction =
  | { type: 'GO_TO_MODE_SELECT' }
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'START_GAME'; players: Player[]; config: MaybeOppositeConfig }
  | { type: 'GAME_OVER'; players: Player[]; bestStreak?: number }
  | { type: 'SHOW_FINAL' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'NEW_GAME' }
  | { type: 'GO_BACK' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GO_TO_MODE_SELECT':
      return { ...state, phase: 'modeSelect' };
    case 'SELECT_MODE':
      return { ...state, phase: 'setup', gameMode: action.mode };
    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        players: action.players,
        config: action.config,
      };
    case 'GAME_OVER':
      return {
        ...state,
        phase: 'roundResult',
        finalPlayers: action.players,
        bestStreak: action.bestStreak ?? state.bestStreak,
      };
    case 'SHOW_FINAL':
      return { ...state, phase: 'gameOver' };
    case 'PLAY_AGAIN':
      return {
        ...state,
        phase: 'setup',
        finalPlayers: [],
      };
    case 'NEW_GAME':
      return {
        phase: 'title',
        gameMode: null,
        config: null,
        players: [],
        finalPlayers: [],
        bestStreak: 0,
      };
    case 'GO_BACK':
      if (state.phase === 'modeSelect') return { ...state, phase: 'title' };
      if (state.phase === 'setup') return { ...state, phase: 'modeSelect' };
      return state;
    default:
      return state;
  }
}

const initialState: GameState = {
  phase: 'title',
  gameMode: null,
  config: null,
  players: [],
  finalPlayers: [],
  bestStreak: 0,
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevPhase = useRef<AppPhase>(state.phase);

  // Fade transition between phases
  useEffect(() => {
    if (prevPhase.current !== state.phase) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      prevPhase.current = state.phase;
    }
  }, [state.phase, fadeAnim]);

  const handleGameOver = useCallback(
    (players: Player[], bestStreak?: number) => {
      dispatch({ type: 'GAME_OVER', players, bestStreak });
    },
    [],
  );

  const renderScreen = () => {
    switch (state.phase) {
      case 'title':
        return (
          <TitleScreen
            onPlay={() => dispatch({ type: 'GO_TO_MODE_SELECT' })}
          />
        );

      case 'modeSelect':
        return (
          <ModeSelectScreen
            onSelectMode={(mode) => dispatch({ type: 'SELECT_MODE', mode })}
            onBack={() => dispatch({ type: 'GO_BACK' })}
          />
        );

      case 'setup':
        return (
          <SetupScreen
            mode={state.gameMode!}
            onStart={(players, config) =>
              dispatch({ type: 'START_GAME', players, config })
            }
            onBack={() => dispatch({ type: 'GO_BACK' })}
          />
        );

      case 'playing':
        if (!state.config || state.players.length === 0) return null;

        if (
          state.config.gameMode === 'classic' ||
          state.config.gameMode === 'kid'
        ) {
          return (
            <ClassicGameScreen
              players={state.players}
              config={state.config}
              onGameOver={(p) => handleGameOver(p)}
            />
          );
        }

        if (state.config.gameMode === 'combo') {
          return (
            <ComboGameScreen
              players={state.players}
              config={state.config}
              onGameOver={(p, best) => handleGameOver(p, best)}
            />
          );
        }

        if (state.config.gameMode === 'betrayal') {
          return (
            <BetrayalGameScreen
              players={state.players}
              config={state.config}
              onGameOver={(p) => handleGameOver(p)}
            />
          );
        }

        return null;

      case 'roundResult':
        return (
          <RoundResultScreen
            players={state.finalPlayers}
            onNext={() => dispatch({ type: 'SHOW_FINAL' })}
          />
        );

      case 'gameOver':
        return (
          <GameOverScreen
            players={state.finalPlayers}
            gameMode={state.gameMode!}
            bestStreak={state.bestStreak}
            onPlayAgain={() => dispatch({ type: 'PLAY_AGAIN' })}
            onNewGame={() => dispatch({ type: 'NEW_GAME' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
  },
  screenContainer: {
    flex: 1,
  },
});
