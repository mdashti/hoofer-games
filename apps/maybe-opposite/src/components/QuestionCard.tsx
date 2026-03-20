import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@hoofer-games/shared';
import type { AnswerMode } from '../types';
import { ModeIndicator } from './ModeIndicator';

type QuestionCardProps = {
  question: string;
  mode: AnswerMode;
  variant?: 'default' | 'kid';
};

export function QuestionCard({
  question,
  mode,
  variant = 'default',
}: QuestionCardProps) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(60);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [question, mode, slideAnim, fadeAnim]);

  const isKid = variant === 'kid';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ModeIndicator mode={mode} variant={variant} animated />

      <View style={styles.questionArea}>
        <Text
          style={[styles.questionText, isKid && styles.questionTextKid]}
          adjustsFontSizeToFit
          numberOfLines={4}
        >
          {question}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadow,
  },
  questionArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    paddingVertical: theme.spacing.md,
  },
  questionText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 44,
  },
  questionTextKid: {
    fontSize: theme.fontSize.title,
    lineHeight: 56,
  },
});
