import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@hoofer-games/shared';

type StreakCounterProps = {
  streak: number;
  bestStreak: number;
  showFire?: boolean;
};

export function StreakCounter({
  streak,
  bestStreak,
  showFire = true,
}: StreakCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    if (streak > prevStreakRef.current) {
      // Streak went up - pop animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 40,
          bounciness: 12,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 6,
        }),
      ]).start();
    } else if (streak === 0 && prevStreakRef.current > 0) {
      // Streak broke - shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 15,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -15,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevStreakRef.current = streak;
  }, [streak, scaleAnim, shakeAnim]);

  const displayFire = showFire && streak > 3;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.streakBox,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        {displayFire && <Text style={styles.fireEmoji}>{'🔥'}</Text>}
        <Text style={styles.streakNumber}>{streak}</Text>
        {displayFire && <Text style={styles.fireEmoji}>{'🔥'}</Text>}
      </Animated.View>

      <Text style={styles.streakLabel}>STREAK</Text>

      <View style={styles.bestRow}>
        <Text style={styles.bestLabel}>BEST: {bestStreak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  fireEmoji: {
    fontSize: 40,
  },
  streakLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
    letterSpacing: 3,
    marginTop: theme.spacing.xs,
  },
  bestRow: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.accent + '40',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  bestLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
});
