import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme, HooferButton, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

export type RoundScore = {
  playerId: string;
  points: number;
  label: string;
  /** 'minority-convinced' | 'minority-unconvinced' | 'majority' | 'tie' */
  reason: string;
};

type RoundResultScreenProps = {
  players: Player[];
  roundScores: RoundScore[];
  currentRound: number;
  totalRounds: number;
  isLastRound: boolean;
  onNext: () => void;
};

function ScoreRow({
  player,
  score,
  index,
}: {
  player: Player;
  score: RoundScore;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pointsScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 200;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        speed: 12,
        bounciness: 5,
      }),
    ]).start();

    // Pop in the points with a delay
    setTimeout(() => {
      Animated.spring(pointsScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 14,
      }).start();

      if (score.points > 0) {
        triggerHaptic('success');
      }
    }, delay + 400);
  }, [fadeAnim, slideAnim, pointsScale, index, score.points]);

  const pointsColor =
    score.points === 3
      ? theme.colors.primary
      : score.points === 1
        ? theme.colors.secondary
        : theme.colors.textLight;

  return (
    <Animated.View
      style={[
        styles.scoreRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.playerDot, { backgroundColor: player.color }]} />
      <View style={styles.scoreInfo}>
        <Text style={styles.playerName} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={styles.reasonText}>{score.label}</Text>
      </View>
      <Animated.View
        style={[styles.pointsBadge, { transform: [{ scale: pointsScale }] }]}
      >
        <Text style={[styles.pointsText, { color: pointsColor }]}>
          +{score.points}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export function RoundResultScreen({
  players,
  roundScores,
  currentRound,
  totalRounds,
  isLastRound,
  onNext,
}: RoundResultScreenProps) {
  const headerFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const totalDelay = players.length * 200 + 800;
    setTimeout(() => {
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, totalDelay);
  }, [headerFade, buttonFade, players.length]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.roundComplete}>Round {currentRound} Complete!</Text>
      </Animated.View>

      <View style={styles.scoreList}>
        {players.map((player, index) => {
          const score = roundScores.find((s) => s.playerId === player.id) ?? {
            playerId: player.id,
            points: 0,
            label: 'Played it Safe',
            reason: 'majority',
          };
          return (
            <ScoreRow
              key={player.id}
              player={player}
              score={score}
              index={index}
            />
          );
        })}
      </View>

      <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
        <HooferButton
          title={isLastRound ? 'See Final Results' : 'Next Round'}
          onPress={() => {
            triggerHaptic('medium');
            onNext();
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  roundComplete: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  scoreList: {
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  playerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: theme.spacing.md,
  },
  scoreInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  reasonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    minWidth: 48,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
  },
  buttonContainer: {
    paddingTop: theme.spacing.lg,
  },
});
