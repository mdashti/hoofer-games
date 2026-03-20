import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { GameShell, theme, triggerHaptic } from '@hoofer-games/shared';
import type { GameMode } from '../types';

type ModeSelectScreenProps = {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
};

type ModeCardData = {
  mode: GameMode;
  title: string;
  description: string;
  players: string;
  emoji: string;
  color: string;
};

const modes: ModeCardData[] = [
  {
    mode: 'classic',
    title: 'Classic',
    description: 'Take turns, flip your brain',
    players: '2-8 players',
    emoji: '🔄',
    color: theme.colors.secondary,
  },
  {
    mode: 'combo',
    title: 'Combo',
    description: 'How long can you survive?',
    players: '1+ players',
    emoji: '⚡',
    color: theme.colors.accent,
  },
  {
    mode: 'betrayal',
    title: 'Group Betrayal',
    description: 'Find the liar',
    players: '4-8 players',
    emoji: '🕵️',
    color: theme.colors.primary,
  },
  {
    mode: 'kid',
    title: 'Kid Mode',
    description: 'Simple & silly',
    players: '2-8 players',
    emoji: '🎈',
    color: '#A855F7',
  },
];

function ModeCard({
  data,
  index,
  onPress,
}: {
  data: ModeCardData;
  index: number;
  onPress: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 80,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, index]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={() => {
          triggerHaptic('medium');
          onPress();
        }}
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
          }).start();
        }}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${data.title}: ${data.description}`}
      >
        <View style={[styles.emojiCircle, { backgroundColor: data.color + '20' }]}>
          <Text style={styles.emoji}>{data.emoji}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{data.title}</Text>
          <Text style={styles.cardDescription}>{data.description}</Text>
          <View style={[styles.playerBadge, { backgroundColor: data.color + '25' }]}>
            <Text style={[styles.playerText, { color: data.color }]}>
              {data.players}
            </Text>
          </View>
        </View>
        <Text style={styles.arrow}>{'\u203A'}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ModeSelectScreen({
  onSelectMode,
  onBack,
}: ModeSelectScreenProps) {
  return (
    <GameShell title="Choose Mode" showBack onBack={onBack}>
      <View style={styles.container}>
        {modes.map((data, index) => (
          <ModeCard
            key={data.mode}
            data={data}
            index={index}
            onPress={() => onSelectMode(data.mode)}
          />
        ))}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  cardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  playerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  playerText: {
    fontSize: theme.fontSize.sm - 2,
    fontWeight: theme.fontWeight.semibold,
  },
  arrow: {
    fontSize: 28,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.bold,
  },
});
