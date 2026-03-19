import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { theme, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { TurfWarConfig, RoundScore } from '../types';
import { useGameEngine } from '../hooks/useGameEngine';
import { Grid } from '../components/Grid';
import { TerritoryBar } from '../components/TerritoryBar';

type BattleScreenProps = {
  players: Player[];
  config: TurfWarConfig;
  round: number;
  onRoundEnd: (scores: RoundScore[]) => void;
};

const TRANSITION_DELAY = 2000; // ms to show "Get Ready [Player]!" between turns

export function BattleScreen({
  players,
  config,
  round,
  onRoundEnd,
}: BattleScreenProps) {
  const {
    grid,
    rows,
    cols,
    currentPlayerIndex,
    turnTimeRemaining,
    turnsRemaining,
    currentTurn,
    totalTurns,
    phase,
    handleCellTap,
    startTurn,
    calculateScores,
    territoryCounts,
  } = useGameEngine(players, config);

  const currentPlayer = players[currentPlayerIndex];
  const counts = territoryCounts();

  // Animations
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;
  const transitionAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // State for transition overlay
  const [showTransition, setShowTransition] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [transitionColor, setTransitionColor] = useState('#000');
  const [showTimesUp, setShowTimesUp] = useState(false);

  const screen = Dimensions.get('window');
  // Reserve space for top bar (~120), territory bar (~70), bottom padding (~20)
  const gridMaxHeight = screen.height - 260;
  const gridMaxWidth = screen.width - 16;

  // Start the first turn automatically
  useEffect(() => {
    // Small delay for the screen to mount
    const timer = setTimeout(() => {
      showPlayerTransition(currentPlayer, true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle phase changes
  useEffect(() => {
    if (phase === 'roundOver') {
      const scores = calculateScores();
      // Small delay for dramatic effect
      setTimeout(() => {
        onRoundEnd(scores);
      }, 500);
    }
  }, [phase]);

  // Timer pulse when time is low
  useEffect(() => {
    if (phase === 'playing' && turnTimeRemaining <= 3 && turnTimeRemaining > 0) {
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(timerPulse, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
      ]).start();
    }
  }, [turnTimeRemaining, phase]);

  // Banner color animation when player changes
  useEffect(() => {
    bannerAnim.setValue(0);
    Animated.spring(bannerAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();
  }, [currentPlayerIndex]);

  const showPlayerTransition = useCallback(
    (player: Player, isFirst: boolean) => {
      if (!isFirst) {
        // Show "TIME'S UP!" flash first
        setShowTimesUp(true);
        flashAnim.setValue(1);
        triggerHaptic('error');

        setTimeout(() => {
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            setShowTimesUp(false);
          });
        }, 600);
      }

      // Show "Get ready [Player]!" transition
      const delay = isFirst ? 0 : 800;
      setTimeout(() => {
        setTransitionText(player.name);
        setTransitionColor(player.color);
        setShowTransition(true);
        transitionAnim.setValue(0);

        Animated.spring(transitionAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 5,
        }).start();

        triggerHaptic('medium');

        setTimeout(() => {
          Animated.timing(transitionAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowTransition(false);
            startTurn();
          });
        }, TRANSITION_DELAY - 300);
      }, delay);
    },
    [startTurn],
  );

  // When transitioning between players
  useEffect(() => {
    if (phase === 'transitioning') {
      const nextPlayer = players[currentPlayerIndex];
      showPlayerTransition(nextPlayer, false);
    }
  }, [phase, currentPlayerIndex]);

  const turnsLeft = totalTurns - currentTurn;
  const playerTurnsLeft = Math.ceil(turnsLeft / players.length);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Top bar: Player indicator + Timer */}
      <Animated.View
        style={[
          styles.topBar,
          {
            opacity: bannerAnim,
            transform: [
              {
                translateY: bannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Current player banner */}
        <View
          style={[
            styles.playerBanner,
            { backgroundColor: currentPlayer.color },
          ]}
        >
          <Text style={styles.playerBannerName}>{currentPlayer.name}</Text>
          <Text style={styles.playerBannerHint}>TAP TO CLAIM!</Text>
        </View>

        {/* Timer + Turn info */}
        <View style={styles.timerRow}>
          <Animated.View
            style={[
              styles.timerContainer,
              {
                transform: [{ scale: timerPulse }],
                backgroundColor:
                  turnTimeRemaining <= 2 ? theme.colors.error + '20' : theme.colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.timerText,
                {
                  color:
                    turnTimeRemaining <= 2
                      ? theme.colors.error
                      : theme.colors.text,
                },
              ]}
            >
              {phase === 'playing' ? turnTimeRemaining : '-'}
            </Text>
            <Text style={styles.timerLabel}>sec</Text>
          </Animated.View>

          <View style={styles.turnInfo}>
            <Text style={styles.turnLabel}>Turns Left</Text>
            <Text style={styles.turnCount}>{turnsRemaining}</Text>
          </View>

          <View style={styles.turnInfo}>
            <Text style={styles.turnLabel}>Round</Text>
            <Text style={styles.turnCount}>{round}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Grid */}
      <View style={styles.gridWrapper}>
        <Grid
          rows={rows}
          cols={cols}
          cells={grid}
          currentPlayer={currentPlayer}
          onCellTap={handleCellTap}
          disabled={phase !== 'playing'}
          maxWidth={gridMaxWidth}
          maxHeight={gridMaxHeight}
        />
      </View>

      {/* Territory counter */}
      <View style={styles.territoryWrapper}>
        <TerritoryBar players={players} counts={counts} />
      </View>

      {/* "TIME'S UP!" flash overlay */}
      {showTimesUp && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: flashAnim },
          ]}
        >
          <View style={styles.timesUpContainer}>
            <Text style={styles.timesUpText}>TIME'S UP!</Text>
          </View>
        </Animated.View>
      )}

      {/* Player transition overlay */}
      {showTransition && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: transitionAnim,
              backgroundColor: transitionColor + 'DD',
            },
          ]}
        >
          <Animated.View
            style={[
              styles.transitionContent,
              {
                transform: [
                  {
                    scale: transitionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.transitionReady}>Get Ready</Text>
            <Text style={styles.transitionName}>{transitionText}</Text>
            <Text style={styles.transitionGo}>TAP FAST!</Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  playerBanner: {
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  playerBannerName: {
    fontSize: theme.fontSize.xl + 4,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playerBannerHint: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginTop: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  timerContainer: {
    width: 64,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
  },
  timerText: {
    fontSize: theme.fontSize.xl + 2,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginTop: -2,
  },
  turnInfo: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  turnLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turnCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  territoryWrapper: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  timesUpContainer: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl + 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  timesUpText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  transitionContent: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  transitionReady: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  transitionName: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  transitionGo: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginTop: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
