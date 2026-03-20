import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { theme, triggerHaptic, HooferButton } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { MaybeOppositeConfig, BetrayalPhase, BetrayalRound } from '../types';
import type { Question } from '../data/questions';
import { getRandomQuestions } from '../data/questions';

type BetrayalGameScreenProps = {
  players: Player[];
  config: MaybeOppositeConfig;
  onGameOver: (players: Player[]) => void;
};

export function BetrayalGameScreen({
  players,
  config,
  onGameOver,
}: BetrayalGameScreenProps) {
  const totalRounds = config.totalRounds;

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<BetrayalPhase>('roleReveal');
  const [rolePlayerIndex, setRolePlayerIndex] = useState(0);
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [answeringPlayerIndex, setAnsweringPlayerIndex] = useState(0);
  const [votingPlayerIndex, setVotingPlayerIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    players.forEach((p) => (s[p.id] = 0));
    return s;
  });
  const [roundResult, setRoundResult] = useState<BetrayalRound | null>(null);

  // Select spy for each round (rotate through players)
  const [spyOrder] = useState<string[]>(() => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const order: string[] = [];
    for (let i = 0; i < totalRounds; i++) {
      order.push(shuffled[i % shuffled.length].id);
    }
    return order;
  });

  const [questionsList] = useState<Question[]>(() =>
    getRandomQuestions(totalRounds),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  const currentSpyId = spyOrder[round];
  const currentQuestion = questionsList[round];
  const currentSpy = players.find((p) => p.id === currentSpyId)!;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    animateIn();
  }, [phase, rolePlayerIndex, answeringPlayerIndex, votingPlayerIndex, animateIn]);

  // ROLE REVEAL PHASE
  const handleRoleGotIt = useCallback(() => {
    triggerHaptic('light');
    setRoleRevealed(false);
    const nextIdx = rolePlayerIndex + 1;
    if (nextIdx >= players.length) {
      // All players saw roles, move to question phase
      setAnsweringPlayerIndex(0);
      setPhase('question');
    } else {
      setRolePlayerIndex(nextIdx);
    }
  }, [rolePlayerIndex, players.length]);

  // QUESTION PHASE - each player answers in turn
  const handleNextAnswerer = useCallback(() => {
    triggerHaptic('light');
    const nextIdx = answeringPlayerIndex + 1;
    if (nextIdx >= players.length) {
      // All answered, move to voting
      setVotingPlayerIndex(0);
      setVotes({});
      setPhase('voting');
    } else {
      setAnsweringPlayerIndex(nextIdx);
    }
  }, [answeringPlayerIndex, players.length]);

  // VOTING PHASE
  const handleVote = useCallback(
    (suspectedSpyId: string) => {
      triggerHaptic('medium');
      const voter = players[votingPlayerIndex];
      const newVotes = { ...votes, [voter.id]: suspectedSpyId };
      setVotes(newVotes);

      const nextIdx = votingPlayerIndex + 1;
      if (nextIdx >= players.length) {
        // All voted, reveal spy
        // Count votes for the spy
        const votesForSpy = Object.values(newVotes).filter(
          (v) => v === currentSpyId,
        ).length;
        const spyCaught = votesForSpy > players.length / 2;

        // Update scores
        const newScores = { ...scores };
        if (spyCaught) {
          // Correct voters get +1
          Object.entries(newVotes).forEach(([voterId, voted]) => {
            if (voted === currentSpyId) {
              newScores[voterId] = (newScores[voterId] ?? 0) + 1;
            }
          });
        } else {
          // Spy gets +2
          newScores[currentSpyId] = (newScores[currentSpyId] ?? 0) + 2;
        }
        setScores(newScores);

        setRoundResult({
          spyId: currentSpyId,
          questionId: currentQuestion.id,
          votes: newVotes,
          spyCaught,
        });
        setPhase('spyReveal');
      } else {
        setVotingPlayerIndex(nextIdx);
      }
    },
    [votingPlayerIndex, votes, players, currentSpyId, scores, currentQuestion],
  );

  // NEXT ROUND / GAME OVER
  const handleNextRound = useCallback(() => {
    triggerHaptic('medium');
    const nextRound = round + 1;
    if (nextRound >= totalRounds) {
      const finalPlayers = players.map((p) => ({
        ...p,
        score: scores[p.id] ?? 0,
      }));
      onGameOver(finalPlayers);
    } else {
      setRound(nextRound);
      setRolePlayerIndex(0);
      setRoleRevealed(false);
      setPhase('roleReveal');
      setRoundResult(null);
    }
  }, [round, totalRounds, players, scores, onGameOver]);

  if (!currentQuestion) return null;

  const roundLabel = `Round ${round + 1}/${totalRounds}`;

  // ===== ROLE REVEAL =====
  if (phase === 'roleReveal') {
    const rolePlayer = players[rolePlayerIndex];
    const isSpy = rolePlayer.id === currentSpyId;

    if (!roleRevealed) {
      return (
        <View style={styles.screen}>
          <Text style={styles.roundLabel}>{roundLabel}</Text>
          <Animated.View style={[styles.centerArea, { opacity: fadeAnim }]}>
            <Text style={styles.passText}>Pass the phone to</Text>
            <View
              style={[
                styles.playerBadge,
                { backgroundColor: rolePlayer.color },
              ]}
            >
              <Text style={styles.playerBadgeText}>{rolePlayer.name}</Text>
            </View>
            <Text style={styles.privateText}>
              (Others look away!)
            </Text>
            <View style={styles.buttonArea}>
              <HooferButton
                title="Reveal My Role"
                onPress={() => {
                  triggerHaptic('medium');
                  setRoleRevealed(true);
                  animateIn();
                }}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </Animated.View>
        </View>
      );
    }

    // Role is revealed
    return (
      <View style={styles.screen}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <Animated.View style={[styles.centerArea, { opacity: fadeAnim }]}>
          {isSpy ? (
            <>
              <Text style={styles.spyEmoji}>{'🕵️'}</Text>
              <View style={styles.roleBannerSpy}>
                <Text style={styles.roleBannerText}>
                  YOU ARE THE SPY!
                </Text>
              </View>
              <Text style={styles.roleInstruction}>
                Answer WRONG but act natural!
              </Text>
              <Text style={styles.roleHint}>
                Everyone else is answering correctly. Blend in!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.innocentEmoji}>{'👀'}</Text>
              <View style={styles.roleBannerInnocent}>
                <Text style={styles.roleBannerText}>
                  Answer CORRECTLY
                </Text>
              </View>
              <Text style={styles.roleInstruction}>
                Watch for the spy!
              </Text>
              <Text style={styles.roleHint}>
                Someone is secretly answering wrong. Spot them!
              </Text>
            </>
          )}
          <View style={styles.buttonArea}>
            <HooferButton
              title="Got it!"
              onPress={handleRoleGotIt}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ===== QUESTION PHASE =====
  if (phase === 'question') {
    const answerer = players[answeringPlayerIndex];

    return (
      <View style={styles.screen}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <Animated.View style={[styles.centerArea, { opacity: fadeAnim }]}>
          <View style={styles.playerTag}>
            <View
              style={[styles.playerDot, { backgroundColor: answerer.color }]}
            />
            <Text style={styles.playerTagName}>
              {answerer.name}&apos;s turn to answer
            </Text>
          </View>

          <View style={styles.questionBanner}>
            <Text style={styles.answerCorrectlyLabel}>
              ANSWER CORRECTLY
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>

          <Text style={styles.speakText}>
            Say your answer out loud!
          </Text>

          <View style={styles.buttonArea}>
            <HooferButton
              title={
                answeringPlayerIndex < players.length - 1
                  ? 'Next Player'
                  : 'Start Voting'
              }
              onPress={handleNextAnswerer}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ===== VOTING PHASE =====
  if (phase === 'voting') {
    const voter = players[votingPlayerIndex];

    return (
      <View style={styles.screen}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <Animated.View style={[styles.centerArea, { opacity: fadeAnim }]}>
          <Text style={styles.voteTitle}>Who was the SPY?</Text>
          <View style={styles.voterTag}>
            <View
              style={[styles.playerDot, { backgroundColor: voter.color }]}
            />
            <Text style={styles.voterName}>{voter.name} votes:</Text>
          </View>

          <ScrollView
            style={styles.voteList}
            contentContainerStyle={styles.voteListContent}
          >
            {players
              .filter((p) => p.id !== voter.id)
              .map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => handleVote(p.id)}
                  style={styles.voteButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Vote for ${p.name}`}
                >
                  <View
                    style={[
                      styles.voteDot,
                      { backgroundColor: p.color },
                    ]}
                  />
                  <Text style={styles.voteButtonText}>{p.name}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  // ===== SPY REVEAL =====
  if (phase === 'spyReveal' && roundResult) {
    const voteCounts: Record<string, number> = {};
    Object.values(roundResult.votes).forEach((votedId) => {
      voteCounts[votedId] = (voteCounts[votedId] ?? 0) + 1;
    });

    return (
      <View style={styles.screen}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <ScrollView contentContainerStyle={styles.revealContent}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', gap: theme.spacing.md }}>
            <Text style={styles.revealEmoji}>
              {roundResult.spyCaught ? '🎉' : '😈'}
            </Text>

            <Text style={styles.revealTitle}>
              {roundResult.spyCaught ? 'SPY CAUGHT!' : 'SPY ESCAPED!'}
            </Text>

            <View
              style={[
                styles.spyRevealBadge,
                { backgroundColor: currentSpy.color },
              ]}
            >
              <Text style={styles.spyRevealName}>
                {'🕵️ '}{currentSpy.name} was the spy
              </Text>
            </View>

            <View style={styles.voteResults}>
              <Text style={styles.voteResultsTitle}>Votes:</Text>
              {players.map((p) => (
                <View key={p.id} style={styles.voteResultRow}>
                  <View
                    style={[
                      styles.voteResultDot,
                      { backgroundColor: p.color },
                    ]}
                  />
                  <Text style={styles.voteResultName}>{p.name}</Text>
                  <Text style={styles.voteResultCount}>
                    {voteCounts[p.id] ?? 0} vote{(voteCounts[p.id] ?? 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.pointsSummary}>
              {roundResult.spyCaught ? (
                <Text style={styles.pointsText}>
                  Correct voters earn +1 point each!
                </Text>
              ) : (
                <Text style={styles.pointsText}>
                  {currentSpy.name} earns +2 points for escaping!
                </Text>
              )}
            </View>

            {/* Mini scoreboard */}
            <View style={styles.miniScoreboard}>
              {[...players]
                .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
                .map((p) => (
                  <View key={p.id} style={styles.miniScoreRow}>
                    <View
                      style={[
                        styles.miniScoreDot,
                        { backgroundColor: p.color },
                      ]}
                    />
                    <Text style={styles.miniScoreName}>{p.name}</Text>
                    <Text style={styles.miniScoreValue}>
                      {scores[p.id] ?? 0}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.buttonArea}>
              <HooferButton
                title={
                  round + 1 >= totalRounds ? 'See Final Results' : 'Next Round'
                }
                onPress={handleNextRound}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: theme.spacing.md,
  },
  roundLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  // ROLE REVEAL
  passText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  playerBadge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  playerBadgeText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  privateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  spyEmoji: {
    fontSize: 64,
  },
  innocentEmoji: {
    fontSize: 64,
  },
  roleBannerSpy: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  roleBannerInnocent: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  roleBannerText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 1,
  },
  roleInstruction: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  roleHint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  buttonArea: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  // QUESTION
  playerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerTagName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  questionBanner: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  answerCorrectlyLabel: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 1.5,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...theme.shadow,
  },
  questionText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  speakText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  // VOTING
  voteTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  voterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  voterName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  voteList: {
    width: '100%',
    maxHeight: 300,
  },
  voteListContent: {
    gap: theme.spacing.sm,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  voteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  voteButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  // SPY REVEAL
  revealContent: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  revealEmoji: {
    fontSize: 64,
  },
  revealTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  spyRevealBadge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  spyRevealName: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  voteResults: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadow,
  },
  voteResultsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  voteResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  voteResultDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  voteResultName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  voteResultCount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
  },
  pointsSummary: {
    backgroundColor: theme.colors.accent + '30',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  pointsText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  miniScoreboard: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  miniScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  miniScoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  miniScoreName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  miniScoreValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
});
