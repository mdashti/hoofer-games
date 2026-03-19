import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme, triggerHaptic } from '@hoofer-games/shared';

type ReadyScreenProps = {
  round: number;
  totalRounds: number;
  onReady: () => void;
};

const COUNTDOWN = ['3', '2', '1', 'GO!'];

export function ReadyScreen({ round, totalRounds, onReady }: ReadyScreenProps) {
  const [step, setStep] = useState(-1); // -1 = showing round info, 0-3 = countdown
  const roundAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const countScale = useRef(new Animated.Value(0.3)).current;

  // Show round info first
  useEffect(() => {
    Animated.spring(roundAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 8,
    }).start();

    const timer = setTimeout(() => {
      setStep(0);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Countdown steps
  useEffect(() => {
    if (step < 0) return;

    if (step >= COUNTDOWN.length) {
      onReady();
      return;
    }

    // Reset and animate
    countAnim.setValue(0);
    countScale.setValue(0.3);

    triggerHaptic(step === 3 ? 'heavy' : 'medium');

    Animated.parallel([
      Animated.timing(countAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(countScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 15,
        bounciness: 8,
      }),
    ]).start();

    // Fade out and advance
    const timer = setTimeout(() => {
      Animated.timing(countAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStep((prev) => prev + 1);
      });
    }, 650);

    return () => clearTimeout(timer);
  }, [step]);

  const screen = Dimensions.get('window');

  return (
    <View style={[styles.container, { width: screen.width, height: screen.height }]}>
      {/* Round info */}
      <Animated.View
        style={[
          styles.roundInfo,
          {
            opacity: roundAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, step < 0 ? 1 : 0.3],
            }),
            transform: [
              {
                scale: roundAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, step < 0 ? 1 : 0.8],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.roundLabel}>Round</Text>
        <Text style={styles.roundNumber}>
          {round} / {totalRounds}
        </Text>
        <Text style={styles.getReady}>Get Ready!</Text>
      </Animated.View>

      {/* Countdown */}
      {step >= 0 && step < COUNTDOWN.length && (
        <Animated.View
          style={[
            styles.countdownContainer,
            {
              opacity: countAnim,
              transform: [{ scale: countScale }],
            },
          ]}
        >
          <Text
            style={[
              styles.countdownText,
              step === 3 && styles.goText,
            ]}
          >
            {COUNTDOWN[step]}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundInfo: {
    alignItems: 'center',
    position: 'absolute',
  },
  roundLabel: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roundNumber: {
    fontSize: 80,
    fontWeight: '900',
    color: theme.colors.text,
    marginVertical: theme.spacing.sm,
  },
  getReady: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.secondary,
    marginTop: theme.spacing.sm,
  },
  countdownContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 140,
    fontWeight: '900',
    color: theme.colors.text,
  },
  goText: {
    fontSize: 100,
    color: theme.colors.success,
    letterSpacing: 4,
  },
});
