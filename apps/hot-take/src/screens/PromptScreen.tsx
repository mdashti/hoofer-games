import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme, HooferButton, triggerHaptic } from '@hoofer-games/shared';
import type { Prompt } from '../data/prompts';

type PromptScreenProps = {
  prompt: Prompt;
  currentRound: number;
  totalRounds: number;
  onReady: () => void;
};

export function PromptScreen({
  prompt,
  currentRound,
  totalRounds,
  onReady,
}: PromptScreenProps) {
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardRotate = useRef(new Animated.Value(-0.03)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const categoryFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 10,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardRotate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 6,
          bounciness: 8,
        }),
      ]),
      Animated.timing(categoryFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardScale, cardFade, cardRotate, buttonFade, categoryFade]);

  const rotateInterpolation = cardRotate.interpolate({
    inputRange: [-0.03, 0],
    outputRange: ['-3deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>
          Round {currentRound} of {totalRounds}
        </Text>
      </View>

      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardFade,
              transform: [
                { scale: cardScale },
                { rotate: rotateInterpolation },
              ],
            },
          ]}
        >
          <Text style={styles.quoteLeft}>{'\u201C'}</Text>
          <Text style={styles.promptText}>{prompt.text}</Text>
          <Text style={styles.quoteRight}>{'\u201D'}</Text>
        </Animated.View>

        <Animated.View style={[styles.categoryBadge, { opacity: categoryFade }]}>
          <Text style={styles.categoryText}>{prompt.category}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
        <HooferButton
          title="Everyone Ready?"
          onPress={() => {
            triggerHaptic('medium');
            onReady();
          }}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  roundBadge: {
    backgroundColor: theme.colors.primary + '18',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xl,
  },
  roundText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    ...theme.shadow,
  },
  quoteLeft: {
    position: 'absolute',
    top: 12,
    left: 16,
    fontSize: 48,
    color: theme.colors.primary + '25',
    fontWeight: theme.fontWeight.bold,
  },
  quoteRight: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    fontSize: 48,
    color: theme.colors.primary + '25',
    fontWeight: theme.fontWeight.bold,
  },
  promptText: {
    fontSize: theme.fontSize.xl + 2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 38,
    paddingHorizontal: theme.spacing.md,
  },
  categoryBadge: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.secondary,
  },
  buttonContainer: {
    width: '100%',
    paddingTop: theme.spacing.lg,
  },
});
