import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {
  theme,
  HooferButton,
  GameShell,
  triggerHaptic,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { RoundScore } from '../types';

type RoundResultScreenProps = {
  players: Player[];
  scores: RoundScore[];
  round: number;
  totalRounds: number;
  onNext: () => void;
};

function AnimatedBar({
  player,
  score,
  maxPercentage,
  index,
}: {
  player: Player;
  score: RoundScore;
  maxPercentage: number;
  index: number;
}) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const screen = Dimensions.get('window');
  const maxBarWidth = screen.width - 160; // leave room for labels
  const targetWidth = maxPercentage > 0
    ? (score.percentage / maxPercentage) * maxBarWidth
    : 0;

  useEffect(() => {
    const delay = index * 200;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
    ]).start();

    // Animate bar width separately (can't use native driver for width)
    Animated.timing(barWidth, {
      toValue: targetWidth,
      duration: 800,
      delay: delay + 200,
      useNativeDriver: false,
    }).start(() => {
      if (index === 0) triggerHaptic('success');
    });
  }, []);

  const isLeader = index === 0;

  return (
    <Animated.View
      style={[
        styles.barRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.barLeft}>
        <View style={[styles.playerDot, { backgroundColor: player.color }]} />
        <Text
          style={[styles.playerName, isLeader && styles.playerNameLeader]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: barWidth,
              backgroundColor: player.color,
            },
            isLeader && styles.barLeader,
          ]}
        />
      </View>

      <View style={styles.barRight}>
        <Text style={[styles.percentage, isLeader && styles.percentageLeader]}>
          {score.percentage}%
        </Text>
        <Text style={styles.cellCount}>
          {score.cells} cells
        </Text>
      </View>
    </Animated.View>
  );
}

export function RoundResultScreen({
  players,
  scores,
  round,
  totalRounds,
  onNext,
}: RoundResultScreenProps) {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Sort scores by percentage (highest first)
  const sortedScores = [...scores].sort((a, b) => b.percentage - a.percentage);
  const maxPercentage = sortedScores.length > 0 ? sortedScores[0].percentage : 1;
  const isLastRound = round >= totalRounds;

  // Map score to player
  const getPlayer = (playerId: string) =>
    players.find((p) => p.id === playerId)!;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.spring(titleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 6,
      }),
      Animated.timing(pointsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start();

    triggerHaptic('success');
  }, []);

  return (
    <GameShell>
      <View style={styles.container}>
        {/* Title */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: titleAnim,
              transform: [
                {
                  scale: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.roundLabel}>Round {round} Results</Text>
          <Text style={styles.subtitle}>Territory Breakdown</Text>
        </Animated.View>

        {/* Animated bar chart */}
        <View style={styles.chartContainer}>
          {sortedScores.map((score, index) => (
            <AnimatedBar
              key={score.playerId}
              player={getPlayer(score.playerId)}
              score={score}
              maxPercentage={maxPercentage}
              index={index}
            />
          ))}
        </View>

        {/* Points awarded */}
        <Animated.View
          style={[
            styles.pointsSection,
            { opacity: pointsAnim },
          ]}
        >
          <Text style={styles.pointsTitle}>Points Awarded</Text>
          <View style={styles.pointsList}>
            {sortedScores.map((score) => {
              const player = getPlayer(score.playerId);
              return (
                <View key={score.playerId} style={styles.pointsRow}>
                  <View
                    style={[styles.pointsDot, { backgroundColor: player.color }]}
                  />
                  <Text style={styles.pointsName}>{player.name}</Text>
                  <Text style={[styles.pointsValue, { color: player.color }]}>
                    +{score.points}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Next button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <HooferButton
            title={isLastRound ? 'Final Results' : 'Next Round'}
            onPress={() => {
              triggerHaptic('medium');
              onNext();
            }}
            variant={isLastRound ? 'accent' : 'primary'}
            size="lg"
            fullWidth
          />
        </Animated.View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: theme.fontSize.xxl + 4,
    fontWeight: '900',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartContainer: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  barRow: {
    gap: theme.spacing.xs,
  },
  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  playerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  playerNameLeader: {
    fontWeight: theme.fontWeight.extrabold,
  },
  barContainer: {
    height: 28,
    backgroundColor: '#E8ECF0',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    minWidth: 4,
  },
  barLeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  barRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.xs,
  },
  percentage: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  percentageLeader: {
    fontSize: theme.fontSize.xl,
    fontWeight: '900',
  },
  cellCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.sm,
  },
  pointsSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  pointsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  pointsList: {
    gap: theme.spacing.sm,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pointsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointsName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  pointsValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.md,
  },
});
