import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { theme, HooferButton, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

type PersuasionVoteScreenProps = {
  /** Players who can vote (everyone except the minority). */
  voters: Player[];
  /** The minority player(s) being judged. */
  minorityPlayers: Player[];
  onAllVotesIn: (votes: Record<string, 'yes' | 'no'>) => void;
};

type Phase = 'pass' | 'vote' | 'recorded';

export function PersuasionVoteScreen({
  voters,
  minorityPlayers,
  onAllVotesIn,
}: PersuasionVoteScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('pass');
  const [votes, setVotes] = useState<Record<string, 'yes' | 'no'>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const yesScale = useRef(new Animated.Value(1)).current;
  const noScale = useRef(new Animated.Value(1)).current;
  const checkFade = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;

  const currentVoter = voters[currentIndex];
  const minorityNames = minorityPlayers.map((p) => p.name).join(' & ');

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateIn();
  }, [currentIndex, phase, animateIn]);

  const handleVote = useCallback(
    (vote: 'yes' | 'no') => {
      triggerHaptic('medium');

      const targetScale = vote === 'yes' ? yesScale : noScale;
      Animated.sequence([
        Animated.timing(targetScale, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(targetScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 12,
        }),
      ]).start();

      const newVotes = { ...votes, [currentVoter.id]: vote };
      setVotes(newVotes);

      // Show confirmation
      setPhase('recorded');
      checkFade.setValue(0);
      checkScale.setValue(0.5);
      Animated.parallel([
        Animated.timing(checkFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 10,
        }),
      ]).start();

      setTimeout(() => {
        if (currentIndex < voters.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setPhase('pass');
        } else {
          onAllVotesIn(newVotes);
        }
      }, 1000);
    },
    [votes, currentVoter, currentIndex, voters.length, onAllVotesIn, yesScale, noScale, checkFade, checkScale],
  );

  const handleReady = useCallback(() => {
    triggerHaptic('light');
    setPhase('vote');
  }, []);

  // ── Pass screen ─────────────────────────────────────────
  if (phase === 'pass') {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.passContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[styles.playerColorBadge, { backgroundColor: currentVoter.color }]}
          />
          <Text style={styles.passTitle}>Pass the phone to</Text>
          <Text style={styles.passName}>{currentVoter.name}</Text>
          <Text style={styles.passHint}>
            Voter {currentIndex + 1} of {voters.length}
          </Text>

          <View style={styles.passButtonContainer}>
            <HooferButton
              title="I'm Ready — Show Me!"
              onPress={handleReady}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ── Recorded screen ─────────────────────────────────────
  if (phase === 'recorded') {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.recordedContainer,
            {
              opacity: checkFade,
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          <Text style={styles.checkEmoji}>{'\u2705'}</Text>
          <Text style={styles.recordedText}>Vote Recorded!</Text>
          <Text style={styles.recordedHint}>
            {currentIndex < voters.length - 1
              ? 'Passing to next voter...'
              : 'All persuasion votes in!'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── Persuasion vote screen ──────────────────────────────
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.voteContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.voterBadge}>
          <View
            style={[styles.voterDot, { backgroundColor: currentVoter.color }]}
          />
          <Text style={styles.voterName}>{currentVoter.name}'s Verdict</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            Was {minorityNames} convincing?
          </Text>
          <View style={styles.minorityAvatars}>
            {minorityPlayers.map((p) => (
              <View
                key={p.id}
                style={[styles.miniDot, { backgroundColor: p.color }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.voteButtons}>
          <Animated.View
            style={[styles.voteButtonWrapper, { transform: [{ scale: yesScale }] }]}
          >
            <Pressable
              onPress={() => handleVote('yes')}
              style={[styles.voteButton, styles.yesButton]}
              accessibilityLabel="Yes, convincing"
            >
              <Text style={styles.voteEmoji}>{'\uD83D\uDC4D'}</Text>
              <Text style={styles.voteLabel}>Yes!</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[styles.voteButtonWrapper, { transform: [{ scale: noScale }] }]}
          >
            <Pressable
              onPress={() => handleVote('no')}
              style={[styles.voteButton, styles.noButton]}
              accessibilityLabel="No, not convincing"
            >
              <Text style={styles.voteEmoji}>{'\uD83D\uDC4E'}</Text>
              <Text style={styles.voteLabel}>Nope!</Text>
            </Pressable>
          </Animated.View>
        </View>
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
  },
  // ── Pass ────────────────
  passContainer: {
    alignItems: 'center',
    width: '100%',
  },
  playerColorBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  passTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  passName: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  passHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  passButtonContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  // ── Recorded ────────────
  recordedContainer: {
    alignItems: 'center',
  },
  checkEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  recordedText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  recordedHint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  // ── Vote ────────────────
  voteContainer: {
    alignItems: 'center',
    width: '100%',
  },
  voterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadow,
  },
  voterDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  voterName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadow,
  },
  questionText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: theme.spacing.md,
  },
  minorityAvatars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  miniDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  voteButtonWrapper: {
    flex: 1,
  },
  voteButton: {
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
  },
  yesButton: {
    backgroundColor: theme.colors.success,
  },
  noButton: {
    backgroundColor: theme.colors.error,
  },
  voteEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  voteLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
