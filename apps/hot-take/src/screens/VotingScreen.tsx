import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { theme, HooferButton, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { Prompt } from '../data/prompts';

type Vote = 'agree' | 'disagree';

type VotingScreenProps = {
  players: Player[];
  prompt: Prompt;
  onAllVotesIn: (votes: Record<string, Vote>) => void;
};

type Phase = 'pass' | 'vote' | 'recorded';

export function VotingScreen({ players, prompt, onAllVotesIn }: VotingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('pass');
  const [votes, setVotes] = useState<Record<string, Vote>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const agreeScale = useRef(new Animated.Value(1)).current;
  const disagreeScale = useRef(new Animated.Value(1)).current;
  const checkFade = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;

  const currentPlayer = players[currentIndex];

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
    (vote: Vote) => {
      triggerHaptic('medium');

      // Bounce the selected button
      const targetScale = vote === 'agree' ? agreeScale : disagreeScale;
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

      const newVotes = { ...votes, [currentPlayer.id]: vote };
      setVotes(newVotes);

      // Show "recorded" confirmation
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

      // After a brief pause, move to next player or finish
      setTimeout(() => {
        if (currentIndex < players.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setPhase('pass');
        } else {
          onAllVotesIn(newVotes);
        }
      }, 1000);
    },
    [votes, currentPlayer, currentIndex, players.length, onAllVotesIn, agreeScale, disagreeScale, checkFade, checkScale],
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
            style={[styles.playerColorBadge, { backgroundColor: currentPlayer.color }]}
          />
          <Text style={styles.passTitle}>Pass the phone to</Text>
          <Text style={styles.passName}>{currentPlayer.name}</Text>
          <Text style={styles.passHint}>
            {currentIndex + 1} of {players.length}
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
            {currentIndex < players.length - 1
              ? `Passing to next player...`
              : 'All votes are in!'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── Voting screen ───────────────────────────────────────
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
            style={[styles.voterDot, { backgroundColor: currentPlayer.color }]}
          />
          <Text style={styles.voterName}>{currentPlayer.name}'s Vote</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt.text}</Text>
        </View>

        <View style={styles.voteButtons}>
          <Animated.View
            style={[styles.voteButtonWrapper, { transform: [{ scale: agreeScale }] }]}
          >
            <Pressable
              onPress={() => handleVote('agree')}
              style={[styles.voteButton, styles.agreeButton]}
              accessibilityLabel="Agree"
            >
              <Text style={styles.voteEmoji}>{'\uD83D\uDD25'}</Text>
              <Text style={styles.voteLabel}>AGREE</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[styles.voteButtonWrapper, { transform: [{ scale: disagreeScale }] }]}
          >
            <Pressable
              onPress={() => handleVote('disagree')}
              style={[styles.voteButton, styles.disagreeButton]}
              accessibilityLabel="Disagree"
            >
              <Text style={styles.voteEmoji}>{'\u2744\uFE0F'}</Text>
              <Text style={styles.voteLabel}>DISAGREE</Text>
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
  promptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadow,
  },
  promptText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 30,
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
  agreeButton: {
    backgroundColor: '#FF6B3D',
  },
  disagreeButton: {
    backgroundColor: '#3B82F6',
  },
  voteEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  voteLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
