import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import {
  GameShell,
  ScoreBoard,
  HooferButton,
  theme,
  sortByScore,
  triggerHaptic,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { GameMode } from '../types';

type GameOverScreenProps = {
  players: Player[];
  gameMode: GameMode;
  bestStreak?: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
};

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const fallAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fallAnim, {
        toValue: 600,
        duration: 2500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 4,
        duration: 2500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fallAnim, fadeAnim, rotateAnim, delay]);

  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    '#A855F7',
    '#3B82F6',
    '#F97316',
    '#EC4899',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 4],
    outputRange: ['0deg', '1440deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 4,
        opacity: fadeAnim,
        transform: [{ translateY: fallAnim }, { rotate: spin }],
      }}
    />
  );
}

export function GameOverScreen({
  players,
  gameMode,
  bestStreak,
  onPlayAgain,
  onNewGame,
}: GameOverScreenProps) {
  const winner = sortByScore(players)[0];
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerHaptic('success');
    Animated.spring(titleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 12,
    }).start();
  }, [titleAnim]);

  const isCombo = gameMode === 'combo';
  const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
    key: i,
    delay: i * 80,
    x: Math.random() * 350,
  }));

  return (
    <GameShell>
      <View style={styles.confettiContainer}>
        {confettiParticles.map((p) => (
          <ConfettiParticle key={p.key} delay={p.delay} x={p.x} />
        ))}
      </View>

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.winnerArea,
            { transform: [{ scale: titleAnim }] },
          ]}
        >
          <Text style={styles.crownEmoji}>{'👑'}</Text>
          <Text style={styles.gameOverTitle}>GAME OVER</Text>

          {winner && (
            <View
              style={[
                styles.winnerBadge,
                { backgroundColor: winner.color },
              ]}
            >
              <Text style={styles.winnerName}>{winner.name} wins!</Text>
            </View>
          )}

          {isCombo && bestStreak !== undefined && (
            <View style={styles.comboHighlight}>
              <Text style={styles.comboLabel}>Best Streak</Text>
              <Text style={styles.comboValue}>
                {'🔥 '}{bestStreak}
              </Text>
            </View>
          )}
        </Animated.View>

        <ScoreBoard players={players} title="Final Scores" showRank />

        <View style={styles.buttonArea}>
          <HooferButton
            title="Play Again"
            onPress={onPlayAgain}
            variant="primary"
            size="lg"
            fullWidth
          />
          <HooferButton
            title="New Game"
            onPress={onNewGame}
            variant="ghost"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 600,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  winnerArea: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  crownEmoji: {
    fontSize: 56,
  },
  gameOverTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: 4,
  },
  winnerBadge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  winnerName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  comboHighlight: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  comboLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  comboValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  buttonArea: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
});
