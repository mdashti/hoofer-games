import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { theme } from '../theme';
import { Player } from '../types';

type ScoreBoardProps = {
  players: Player[];
  title?: string;
  showRank?: boolean;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: '#FFD700' }]}>
        <Text style={styles.rankCrown}>&#9733;</Text>
      </View>
    );
  }
  if (rank === 2) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
    );
  }
  if (rank === 3) {
    return (
      <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.rankBadge, { backgroundColor: theme.colors.textLight + '30' }]}>
      <Text style={[styles.rankText, { color: theme.colors.textLight }]}>{rank}</Text>
    </View>
  );
}

function ScoreRow({
  player,
  rank,
  showRank,
  index,
}: {
  player: Player;
  rank: number;
  showRank: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scoreAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const delay = index * 80;
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
        speed: 12,
        bounciness: 5,
      }),
      Animated.timing(scoreAnim, {
        toValue: 1,
        duration: 500,
        delay: delay + 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scoreAnim, index]);

  const isLeader = rank === 1;

  return (
    <Animated.View
      style={[
        styles.scoreRow,
        isLeader && styles.scoreRowLeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {showRank && <RankBadge rank={rank} />}

      <View style={[styles.playerDot, { backgroundColor: player.color }]} />

      <Text
        style={[styles.playerName, isLeader && styles.playerNameLeader]}
        numberOfLines={1}
      >
        {player.name}
      </Text>

      <Animated.View style={{ opacity: scoreAnim }}>
        <Text style={[styles.score, isLeader && styles.scoreLeader]}>
          {player.score.toLocaleString()}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export function ScoreBoard({
  players,
  title,
  showRank = true,
}: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.list}>
        {sorted.map((player, index) => (
          <ScoreRow
            key={player.id}
            player={player}
            rank={index + 1}
            showRank={showRank}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  list: {
    gap: theme.spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadow,
  },
  scoreRowLeader: {
    backgroundColor: '#FFFDF0',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rankCrown: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  rankText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
  },
  playerName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  playerNameLeader: {
    fontWeight: theme.fontWeight.bold,
  },
  score: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    minWidth: 50,
    textAlign: 'right',
  },
  scoreLeader: {
    fontSize: theme.fontSize.xl,
    color: '#D4A017',
  },
});
