import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { theme, triggerHaptic, HooferButton } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { AnswerMode, MaybeOppositeConfig } from '../types';
import type { Question } from '../data/questions';
import { getRandomQuestions } from '../data/questions';
import { ModeIndicator } from '../components/ModeIndicator';
import { TimerBar } from '../components/TimerBar';
import { StreakCounter } from '../components/StreakCounter';
import { useGameTimer } from '../hooks/useGameTimer';

type ComboGameScreenProps = {
  players: Player[];
  config: MaybeOppositeConfig;
  onGameOver: (players: Player[], bestStreak: number) => void;
};

type ComboPhase = 'playing' | 'streakBroken' | 'speedUp';

const INITIAL_SPEED = 3;
const SPEED_DECREASE = 0.2;
const SPEED_MILESTONE = 5;
const MIN_SPEED = 1.5;

function getRandomMode(): AnswerMode {
  return Math.random() < 0.5 ? 'correct' : 'wrong';
}

export function ComboGameScreen({
  players,
  config,
  onGameOver,
}: ComboGameScreenProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [phase, setPhase] = useState<ComboPhase>('playing');
  const [questionPool, setQuestionPool] = useState<Question[]>(() =>
    getRandomQuestions(200),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<AnswerMode>(getRandomMode);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    players.forEach((p) => (s[p.id] = 0));
    return s;
  });

  const flashAnim = useRef(new Animated.Value(0)).current;
  const speedUpAnim = useRef(new Animated.Value(0)).current;

  const currentPlayer = players[currentPlayerIndex];
  const currentQuestion = questionPool[questionIndex % questionPool.length];

  const handleTimerComplete = useCallback(() => {
    // Time expired = fail
    triggerHaptic('error');
    const finalStreak = streak;
    if (finalStreak > bestStreak) {
      setBestStreak(finalStreak);
    }
    // Update player score with their best streak
    setScores((prev) => ({
      ...prev,
      [currentPlayer.id]: Math.max(prev[currentPlayer.id] ?? 0, finalStreak),
    }));
    setStreak(0);
    setSpeed(INITIAL_SPEED);
    setPhase('streakBroken');
  }, [streak, bestStreak, currentPlayer]);

  const timer = useGameTimer(speed, handleTimerComplete);

  // Start timer when playing
  useEffect(() => {
    if (phase === 'playing') {
      timer.reset();
      // Small delay so the reset takes effect before start
      const t = setTimeout(() => timer.start(), 50);
      return () => clearTimeout(t);
    }
  }, [phase, questionIndex]);

  const nextQuestion = useCallback(() => {
    setQuestionIndex((prev) => {
      const next = prev + 1;
      // Replenish pool if needed
      if (next >= questionPool.length - 5) {
        setQuestionPool((pool) => [
          ...pool,
          ...getRandomQuestions(50),
        ]);
      }
      return next;
    });
    setCurrentMode(getRandomMode());
  }, [questionPool.length]);

  const handleAnswer = useCallback(
    (playerAnswer: boolean) => {
      timer.stop();

      // Determine what the correct tap is
      let expectedTap: boolean;
      if (currentMode === 'correct') {
        expectedTap = currentQuestion.answer;
      } else {
        expectedTap = !currentQuestion.answer;
      }

      const isCorrect = playerAnswer === expectedTap;

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        triggerHaptic('light');

        // Flash green
        flashAnim.setValue(1);
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Speed up milestone
        if (newStreak % SPEED_MILESTONE === 0) {
          const newSpeed = Math.max(MIN_SPEED, speed - SPEED_DECREASE);
          if (newSpeed < speed) {
            setSpeed(newSpeed);
            triggerHaptic('heavy');
            // Show speed up flash
            setPhase('speedUp');
            speedUpAnim.setValue(0);
            Animated.sequence([
              Animated.timing(speedUpAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.delay(500),
              Animated.timing(speedUpAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setPhase('playing');
              nextQuestion();
            });
            return;
          }
        }

        nextQuestion();
      } else {
        // Wrong!
        triggerHaptic('error');
        const finalStreak = streak;
        if (finalStreak > bestStreak) {
          setBestStreak(finalStreak);
        }
        setScores((prev) => ({
          ...prev,
          [currentPlayer.id]: Math.max(
            prev[currentPlayer.id] ?? 0,
            finalStreak,
          ),
        }));
        setStreak(0);
        setSpeed(INITIAL_SPEED);
        setPhase('streakBroken');
      }
    },
    [
      timer,
      currentMode,
      currentQuestion,
      streak,
      bestStreak,
      speed,
      nextQuestion,
      flashAnim,
      speedUpAnim,
      currentPlayer,
    ],
  );

  const handleNextPlayer = useCallback(() => {
    const nextIdx = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIdx);
    setStreak(0);
    setSpeed(INITIAL_SPEED);
    nextQuestion();
    setPhase('playing');
  }, [currentPlayerIndex, players.length, nextQuestion]);

  const handleEndGame = useCallback(() => {
    // Ensure current player's score is saved
    const finalScores = { ...scores };
    const currentBest = Math.max(bestStreak, streak);
    if (streak > (finalScores[currentPlayer.id] ?? 0)) {
      finalScores[currentPlayer.id] = streak;
    }
    const finalPlayers = players.map((p) => ({
      ...p,
      score: finalScores[p.id] ?? 0,
    }));
    onGameOver(finalPlayers, currentBest);
  }, [scores, streak, bestStreak, currentPlayer, players, onGameOver]);

  if (!currentQuestion) return null;

  // STREAK BROKEN
  if (phase === 'streakBroken') {
    return (
      <View style={styles.screen}>
        <View style={styles.centerArea}>
          <Text style={styles.brokenEmoji}>{'💥'}</Text>
          <Text style={styles.brokenText}>STREAK BROKEN!</Text>
          <Text style={styles.brokenScore}>
            {currentPlayer.name} got {scores[currentPlayer.id] ?? 0} in a row
          </Text>
          <Text style={styles.bestStreakText}>
            Session best: {bestStreak}
          </Text>

          <View style={styles.brokenButtons}>
            {players.length > 1 && (
              <HooferButton
                title="Next Player"
                onPress={handleNextPlayer}
                variant="secondary"
                size="lg"
                fullWidth
              />
            )}
            <HooferButton
              title="Try Again"
              onPress={() => {
                setStreak(0);
                setSpeed(INITIAL_SPEED);
                nextQuestion();
                setPhase('playing');
              }}
              variant="primary"
              size="lg"
              fullWidth
            />
            <HooferButton
              title="End Game"
              onPress={handleEndGame}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }

  // SPEED UP FLASH
  if (phase === 'speedUp') {
    return (
      <View style={styles.screen}>
        <View style={styles.playerTag}>
          <View
            style={[styles.playerDot, { backgroundColor: currentPlayer.color }]}
          />
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
        </View>
        <StreakCounter streak={streak} bestStreak={bestStreak} />
        <Animated.View
          style={[styles.speedUpBanner, { opacity: speedUpAnim }]}
        >
          <Text style={styles.speedUpText}>{'⚡ SPEED UP! ⚡'}</Text>
          <Text style={styles.speedUpDetail}>
            {speed.toFixed(1)}s per question
          </Text>
        </Animated.View>
      </View>
    );
  }

  // PLAYING
  return (
    <View style={styles.screen}>
      {/* Correct flash overlay */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
            backgroundColor: theme.colors.success + '30',
          },
        ]}
        pointerEvents="none"
      />

      <View style={styles.playerTag}>
        <View
          style={[styles.playerDot, { backgroundColor: currentPlayer.color }]}
        />
        <Text style={styles.playerName}>{currentPlayer.name}</Text>
      </View>

      <StreakCounter streak={streak} bestStreak={bestStreak} />

      <ModeIndicator mode={currentMode} animated />

      <View style={styles.questionArea}>
        <Text
          style={styles.questionText}
          adjustsFontSizeToFit
          numberOfLines={3}
        >
          {currentQuestion.text}
        </Text>
      </View>

      <TimerBar progress={timer.progress} height="md" />

      <View style={styles.answerButtons}>
        <Pressable
          onPress={() => handleAnswer(true)}
          style={[styles.answerButton, styles.trueButton]}
          accessibilityRole="button"
          accessibilityLabel="True"
        >
          <Text style={styles.answerButtonText}>TRUE</Text>
        </Pressable>
        <Pressable
          onPress={() => handleAnswer(false)}
          style={[styles.answerButton, styles.falseButton]}
          accessibilityRole="button"
          accessibilityLabel="False"
        >
          <Text style={styles.answerButtonText}>FALSE</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleEndGame}
        style={styles.endButton}
        accessibilityRole="button"
      >
        <Text style={styles.endButtonText}>End Game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  playerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  questionArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...theme.shadow,
  },
  questionText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  answerButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
  },
  trueButton: {
    backgroundColor: theme.colors.success,
  },
  falseButton: {
    backgroundColor: theme.colors.error,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 2,
  },
  endButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  endButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  // STREAK BROKEN
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  brokenEmoji: {
    fontSize: 64,
  },
  brokenText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.error,
    letterSpacing: 2,
  },
  brokenScore: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  bestStreakText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  brokenButtons: {
    width: '100%',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  // SPEED UP
  speedUpBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  speedUpText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  speedUpDetail: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
});
