import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme, HooferButton } from '@hoofer-games/shared';

type TitleScreenProps = {
  onNewGame: () => void;
};

export function TitleScreen({ onNewGame }: TitleScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const flameScale = useRef(new Animated.Value(0.8)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 8,
          bounciness: 8,
        }),
        Animated.spring(flameScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 6,
          bounciness: 14,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Looping gentle pulse on the flame
    const loopPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loopPulse.start();

    return () => loopPulse.stop();
  }, [fadeAnim, slideAnim, flameScale, subtitleFade, buttonFade, pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.flameContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: Animated.multiply(flameScale, pulseAnim) }],
            },
          ]}
        >
          <Text style={styles.flame}>&#x1F525;</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.title}>HOT TAKE</Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleFade }}>
          <Text style={styles.subtitle}>The Spicy Opinion Game</Text>
        </Animated.View>

        <Animated.View style={[styles.rulesCard, { opacity: subtitleFade }]}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          <Text style={styles.rulesText}>
            1. Everyone reads a spicy opinion{'\n'}
            2. Vote AGREE or DISAGREE{'\n'}
            3. The minority must defend their take!{'\n'}
            4. Convince the group to earn points
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
        <HooferButton
          title="New Game"
          onPress={onNewGame}
          variant="primary"
          size="lg"
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  flameContainer: {
    marginBottom: theme.spacing.sm,
  },
  flame: {
    fontSize: 72,
  },
  title: {
    fontSize: 56,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  rulesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    ...theme.shadow,
  },
  rulesTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  rulesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 26,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
});
