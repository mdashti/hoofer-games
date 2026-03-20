import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { theme, triggerHaptic } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { AnswerMode, MaybeOppositeConfig, ClassicPhase } from '../types';
import type { Question } from '../data/questions';
import { getRandomQuestions, getEasyQuestions } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { JudgeButtons } from '../components/JudgeButtons';
import { useGameTimer } from '../hooks/useGameTimer';

type ClassicGameScreenProps = {
  players: Player[];
  config: MaybeOppositeConfig;
  onGameOver: (players: Player[]) => void;
};

function getExpectedAnswer(question: Question, mode: AnswerMode): string {
  if (mode === 'correct') {
    return question.answer ? 'YES / TRUE' : 'NO / FALSE';
  }
  // Wrong mode: opposite
  return question.answer ? 'NO / FALSE' : 'YES / TRUE';
}

function generateModeSequence(total: number, isKid: boolean): AnswerMode[] {
  const sequence: AnswerMode[] = [];
  let lastMode: AnswerMode = 'wrong'; // start with correct

  for (let i = 0; i < total; i++) {
    if (isKid) {
      // Kid mode: strict alternation
      lastMode = lastMode === 'correct' ? 'wrong' : 'correct';
    } else {
      // Classic mode: alternate with occasional doubles
      if (i > 0 && i % 5 === 0 && Math.random() < 0.4) {
        // Keep the same mode (double!) to trip people up
      } else {
        lastMode = lastMode === 'correct' ? 'wrong' : 'correct';
      }
    }
    sequence.push(lastMode);
  }
  return sequence;
}

export function ClassicGameScreen({
  players,
  config,
  onGameOver,
}: ClassicGameScreenProps) {
  const isKid = config.gameMode === 'kid';
  const variant = isKid ? 'kid' : 'default';
  const totalQuestions = config.questionsPerPlayer * players.length;

  // Game state
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    players.forEach((p) => (s[p.id] = 0));
    return s;
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<ClassicPhase>('getReady');
  const [timeExpired, setTimeExpired] = useState(false);

  // Pregenerated data
  const [questionsList] = useState<Question[]>(() => {
    if (isKid) {
      return getEasyQuestions(totalQuestions);
    }
    return getRandomQuestions(totalQuestions);
  });
  const [modeSequence] = useState<AnswerMode[]>(() =>
    generateModeSequence(totalQuestions, isKid),
  );

  // Current question info
  const currentPlayerIndex = questionIndex % players.length;
  const currentPlayer = players[currentPlayerIndex];
  const currentQuestion = questionsList[questionIndex];
  const currentMode = modeSequence[questionIndex];

  // Animation refs
  const phaseAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const [resultType, setResultType] = useState<'correct' | 'wrong'>('correct');

  // Timer
  const handleTimerComplete = useCallback(() => {
    setTimeExpired(true);
    setPhase('judgment');
    triggerHaptic('error');
  }, []);

  const timer = useGameTimer(config.timerDuration, handleTimerComplete);

  // Phase transitions with animations
  const animatePhaseIn = useCallback(() => {
    phaseAnim.setValue(0);
    Animated.timing(phaseAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [phaseAnim]);

  // Auto-advance from getReady to question
  useEffect(() => {
    if (phase === 'getReady') {
      animatePhaseIn();
      const timeout = setTimeout(() => {
        setPhase('question');
        setTimeExpired(false);
        animatePhaseIn();
        timer.reset();
        timer.start();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase, animatePhaseIn, timer]);

  // Auto-advance from quickResult to next question
  useEffect(() => {
    if (phase === 'quickResult') {
      resultAnim.setValue(0);
      Animated.spring(resultAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }).start();

      const timeout = setTimeout(() => {
        const nextIndex = questionIndex + 1;
        if (nextIndex >= totalQuestions) {
          // Game over
          const finalPlayers = players.map((p) => ({
            ...p,
            score: scores[p.id] ?? 0,
          }));
          onGameOver(finalPlayers);
        } else {
          setQuestionIndex(nextIndex);
          setPhase('getReady');
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [phase, questionIndex, totalQuestions, scores, players, onGameOver, resultAnim]);

  const handleIAnswered = useCallback(() => {
    timer.stop();
    setPhase('judgment');
    animatePhaseIn();
  }, [timer, animatePhaseIn]);

  const handleJudgment = useCallback(
    (gotItRight: boolean) => {
      if (gotItRight) {
        setScores((prev) => ({
          ...prev,
          [currentPlayer.id]: (prev[currentPlayer.id] ?? 0) + 1,
        }));
        setResultType('correct');
        triggerHaptic('success');
      } else {
        setResultType('wrong');
        triggerHaptic('error');
      }
      setPhase('quickResult');
    },
    [currentPlayer],
  );

  if (!currentQuestion) {
    return null;
  }

  // Score bar at top
  const scoreBar = (
    <View style={styles.scoreBar}>
      {players.map((p) => (
        <View key={p.id} style={styles.scoreItem}>
          <View
            style={[
              styles.scoreDot,
              { backgroundColor: p.color },
              p.id === currentPlayer.id && styles.scoreDotActive,
            ]}
          />
          <Text
            style={[
              styles.scoreName,
              p.id === currentPlayer.id && styles.scoreNameActive,
            ]}
            numberOfLines={1}
          >
            {p.name}
          </Text>
          <Text style={styles.scoreValue}>{scores[p.id] ?? 0}</Text>
        </View>
      ))}
    </View>
  );

  const questionCounter = (
    <Text style={styles.questionCounter}>
      Q {questionIndex + 1}/{totalQuestions}
    </Text>
  );

  // GET READY PHASE
  if (phase === 'getReady') {
    return (
      <View style={styles.screen}>
        {scoreBar}
        {questionCounter}
        <Animated.View
          style={[styles.centerArea, { opacity: phaseAnim }]}
        >
          <Text style={styles.getReadyText}>Get Ready</Text>
          <View
            style={[
              styles.playerNameBadge,
              { backgroundColor: currentPlayer.color },
            ]}
          >
            <Text style={styles.playerNameText}>{currentPlayer.name}!</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  // QUESTION PHASE
  if (phase === 'question') {
    return (
      <View style={styles.screen}>
        {scoreBar}
        {questionCounter}
        <Animated.View
          style={[styles.questionPhaseArea, { opacity: phaseAnim }]}
        >
          <View style={styles.playerTag}>
            <View
              style={[
                styles.playerTagDot,
                { backgroundColor: currentPlayer.color },
              ]}
            />
            <Text style={styles.playerTagName}>{currentPlayer.name}</Text>
          </View>

          <QuestionCard
            question={currentQuestion.text}
            mode={currentMode}
            variant={variant}
          />

          <View style={styles.timerArea}>
            <TimerBar progress={timer.progress} height="lg" />
          </View>

          <Pressable
            onPress={handleIAnswered}
            style={styles.iAnsweredButton}
            accessibilityRole="button"
            accessibilityLabel="I answered"
          >
            <Text style={styles.iAnsweredText}>I Answered!</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // JUDGMENT PHASE
  if (phase === 'judgment') {
    const expected = getExpectedAnswer(currentQuestion, currentMode);

    return (
      <View style={styles.screen}>
        {scoreBar}
        {questionCounter}
        <Animated.View
          style={[styles.judgmentArea, { opacity: phaseAnim }]}
        >
          {timeExpired && (
            <View style={styles.timesUpBanner}>
              <Text style={styles.timesUpText}>{"TIME'S UP!"}</Text>
            </View>
          )}

          <View style={styles.judgmentCard}>
            <Text style={styles.judgmentQuestionLabel}>Question:</Text>
            <Text style={styles.judgmentQuestionText}>
              {currentQuestion.text}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.expectedLabel}>Expected answer:</Text>
            <Text style={styles.expectedAnswer}>{expected}</Text>

            <Text style={styles.modeNote}>
              (Mode was:{' '}
              {isKid
                ? currentMode === 'correct'
                  ? 'TRUTH'
                  : 'SILLY'
                : currentMode === 'correct'
                  ? 'ANSWER CORRECTLY'
                  : 'ANSWER WRONG'}
              )
            </Text>
          </View>

          {timeExpired ? (
            <View style={styles.autoWrongArea}>
              <Text style={styles.autoWrongText}>
                Auto-marked as wrong
              </Text>
              <Pressable
                onPress={() => handleJudgment(false)}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </Pressable>
            </View>
          ) : (
            <JudgeButtons
              onCorrect={() => handleJudgment(true)}
              onWrong={() => handleJudgment(false)}
            />
          )}
        </Animated.View>
      </View>
    );
  }

  // QUICK RESULT PHASE
  if (phase === 'quickResult') {
    return (
      <View style={styles.screen}>
        {scoreBar}
        <Animated.View
          style={[
            styles.resultArea,
            { transform: [{ scale: resultAnim }] },
          ]}
        >
          {resultType === 'correct' ? (
            <>
              <Text style={styles.resultEmoji}>{'🎉'}</Text>
              <Text style={[styles.resultText, { color: theme.colors.success }]}>
                +1 POINT!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.resultEmoji}>{'😬'}</Text>
              <Text style={[styles.resultText, { color: theme.colors.error }]}>
                NOPE!
              </Text>
            </>
          )}
        </Animated.View>
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
  scoreBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  scoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scoreDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  scoreName: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.textLight,
    maxWidth: 50,
    fontWeight: theme.fontWeight.medium,
  },
  scoreNameActive: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  scoreValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  questionCounter: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  // GET READY
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  getReadyText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
  },
  playerNameBadge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  playerNameText: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  // QUESTION
  questionPhaseArea: {
    flex: 1,
    gap: theme.spacing.md,
  },
  playerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    alignSelf: 'center',
  },
  playerTagDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerTagName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  timerArea: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  iAnsweredButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadow,
  },
  iAnsweredText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  // JUDGMENT
  judgmentArea: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  timesUpBanner: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  timesUpText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 2,
  },
  judgmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadow,
  },
  judgmentQuestionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  judgmentQuestionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.textLight + '30',
    marginVertical: theme.spacing.sm,
  },
  expectedLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expectedAnswer: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.sm,
  },
  modeNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  autoWrongArea: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  autoWrongText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  // QUICK RESULT
  resultArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  resultEmoji: {
    fontSize: 64,
  },
  resultText: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 2,
  },
});
