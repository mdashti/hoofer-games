import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme, HooferButton, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { Prompt } from '../data/prompts';

type Vote = 'agree' | 'disagree';

type RevealScreenProps = {
  players: Player[];
  prompt: Prompt;
  votes: Record<string, Vote>;
  onStartDebate: () => void;
};

function PlayerVoteCard({
  player,
  vote,
  isMinority,
  index,
}: {
  player: Player;
  vote: Vote;
  isMinority: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const delay = 400 + index * 350;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start(() => {
      if (index === 0) {
        triggerHaptic('medium');
      }
    });
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={[
        styles.voteCard,
        isMinority && styles.voteCardMinority,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.playerDot, { backgroundColor: player.color }]} />
      <Text style={styles.playerName} numberOfLines={1}>
        {player.name}
      </Text>
      <View
        style={[
          styles.voteBadge,
          vote === 'agree' ? styles.agreeBadge : styles.disagreeBadge,
        ]}
      >
        <Text style={styles.voteEmoji}>
          {vote === 'agree' ? '\uD83D\uDD25' : '\u2744\uFE0F'}
        </Text>
        <Text style={styles.voteText}>
          {vote === 'agree' ? 'Agree' : 'Disagree'}
        </Text>
      </View>
      {isMinority && (
        <View style={styles.minorityTag}>
          <Text style={styles.minorityTagText}>MINORITY</Text>
        </View>
      )}
    </Animated.View>
  );
}

export function RevealScreen({
  players,
  prompt,
  votes,
  onStartDebate,
}: RevealScreenProps) {
  const headerFade = useRef(new Animated.Value(0)).current;
  const splitFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const [showButton, setShowButton] = useState(false);

  const agreeCount = Object.values(votes).filter((v) => v === 'agree').length;
  const disagreeCount = Object.values(votes).filter((v) => v === 'disagree').length;
  const minorityVote: Vote = agreeCount <= disagreeCount ? 'agree' : 'disagree';

  // Determine if it's a tie (no minority)
  const isTie = agreeCount === disagreeCount;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // After all cards are revealed, show the split and button
    const totalDelay = 400 + players.length * 350 + 300;
    setTimeout(() => {
      triggerHaptic('success');
      Animated.timing(splitFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, totalDelay);

    setTimeout(() => {
      setShowButton(true);
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, totalDelay + 400);
  }, [headerFade, splitFade, buttonFade, players.length]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.revealTitle}>The Votes Are In!</Text>
        <View style={styles.promptMini}>
          <Text style={styles.promptMiniText} numberOfLines={2}>
            {prompt.text}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.cardsContainer}>
        {players.map((player, index) => {
          const vote = votes[player.id];
          const isMinority = !isTie && vote === minorityVote;
          return (
            <PlayerVoteCard
              key={player.id}
              player={player}
              vote={vote}
              isMinority={isMinority}
              index={index}
            />
          );
        })}
      </View>

      <Animated.View style={[styles.splitContainer, { opacity: splitFade }]}>
        <View style={styles.splitBar}>
          <View
            style={[
              styles.splitAgree,
              { flex: agreeCount || 0.1 },
            ]}
          >
            <Text style={styles.splitCount}>
              {'\uD83D\uDD25'} {agreeCount}
            </Text>
          </View>
          <View
            style={[
              styles.splitDisagree,
              { flex: disagreeCount || 0.1 },
            ]}
          >
            <Text style={styles.splitCount}>
              {'\u2744\uFE0F'} {disagreeCount}
            </Text>
          </View>
        </View>
        {isTie && (
          <Text style={styles.tieText}>
            It's a tie! No minority this round.
          </Text>
        )}
      </Animated.View>

      {showButton && (
        <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
          <HooferButton
            title={isTie ? 'Skip to Scoring' : 'Start Debate!'}
            onPress={() => {
              triggerHaptic('medium');
              onStartDebate();
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  revealTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  promptMini: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow,
  },
  promptMiniText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: theme.spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadow,
  },
  voteCardMinority: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: '#FFFDF0',
  },
  playerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.md,
  },
  playerName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  agreeBadge: {
    backgroundColor: '#FF6B3D20',
  },
  disagreeBadge: {
    backgroundColor: '#3B82F620',
  },
  voteEmoji: {
    fontSize: 14,
  },
  voteText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  minorityTag: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  minorityTagText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  splitContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  splitBar: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  splitAgree: {
    backgroundColor: '#FF6B3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitDisagree: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitCount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  tieText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
});
