import React, { useRef, useEffect } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@hoofer-games/shared';
import type { AnswerMode } from '../types';

type ModeIndicatorProps = {
  mode: AnswerMode;
  variant?: 'default' | 'kid';
  animated?: boolean;
};

export function ModeIndicator({
  mode,
  variant = 'default',
  animated = true,
}: ModeIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) {
      scaleAnim.setValue(1);
      return;
    }

    // Spring entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    // Shake effect for WRONG mode
    if (mode === 'wrong') {
      const shakeSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 3,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -3,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 2,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ]),
      );
      shakeSequence.start();

      // Pulsing for WRONG mode
      const pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseSequence.start();

      return () => {
        shakeSequence.stop();
        pulseSequence.stop();
      };
    } else {
      shakeAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [mode, animated, scaleAnim, shakeAnim, pulseAnim]);

  const isWrong = mode === 'wrong';
  const bgColor = isWrong ? theme.colors.error : theme.colors.success;

  const labelText =
    variant === 'kid'
      ? isWrong
        ? 'SILLY'
        : 'TRUTH'
      : isWrong
        ? 'ANSWER WRONG'
        : 'ANSWER CORRECTLY';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <Text style={styles.label}>{labelText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
