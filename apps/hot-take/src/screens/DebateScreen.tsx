import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme, HooferButton, Timer, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { Prompt } from '../data/prompts';

type DebateScreenProps = {
  minorityPlayers: Player[];
  prompt: Prompt;
  onFinish: () => void;
};

export function DebateScreen({
  minorityPlayers,
  prompt,
  onFinish,
}: DebateScreenProps) {
  const [timerDone, setTimerDone] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timesUpScale = useRef(new Animated.Value(0.5)).current;
  const timesUpFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Auto-start the timer after a brief intro delay
    const timeout = setTimeout(() => setTimerRunning(true), 800);
    return () => clearTimeout(timeout);
  }, [fadeAnim]);

  const handleTimerComplete = useCallback(() => {
    setTimerDone(true);
    setTimerRunning(false);
    triggerHaptic('error');

    // Shake + scale animation for "Time's Up"
    Animated.parallel([
      Animated.timing(timesUpFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(timesUpScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 14,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, [shakeAnim, timesUpScale, timesUpFade]);

  const minorityNames = minorityPlayers.map((p) => p.name).join(' & ');

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        <Text style={styles.debateTitle}>Defend Your Take!</Text>

        <View style={styles.minoritySection}>
          <Text style={styles.minorityLabel}>In the Hot Seat</Text>
          <View style={styles.minorityPlayers}>
            {minorityPlayers.map((player) => (
              <View key={player.id} style={styles.minorityPlayer}>
                <View
                  style={[
                    styles.minorityDot,
                    { backgroundColor: player.color },
                  ]}
                />
                <Text style={styles.minorityName}>{player.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt.text}</Text>
        </View>

        <View style={styles.timerSection}>
          {!timerDone ? (
            <Timer
              duration={30}
              onComplete={handleTimerComplete}
              isRunning={timerRunning}
              size="lg"
            />
          ) : (
            <Animated.View
              style={[
                styles.timesUpContainer,
                {
                  opacity: timesUpFade,
                  transform: [{ scale: timesUpScale }],
                },
              ]}
            >
              <Text style={styles.timesUpEmoji}>{'\u23F0'}</Text>
              <Text style={styles.timesUpText}>Time's Up!</Text>
            </Animated.View>
          )}
        </View>

        {!timerRunning && !timerDone && (
          <Text style={styles.getReady}>Get ready to debate...</Text>
        )}
      </Animated.View>

      {timerDone && (
        <View style={styles.buttonContainer}>
          <HooferButton
            title="Vote on Persuasion"
            onPress={() => {
              triggerHaptic('medium');
              onFinish();
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debateTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  minoritySection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  minorityLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  minorityPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  minorityPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  minorityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: theme.spacing.sm,
  },
  minorityName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  promptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    ...theme.shadow,
  },
  promptText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  timesUpContainer: {
    alignItems: 'center',
  },
  timesUpEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  timesUpText: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.error,
  },
  getReady: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  buttonContainer: {
    paddingTop: theme.spacing.md,
  },
});
