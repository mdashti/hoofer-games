import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme, HooferButton, ScoreBoard, triggerHaptic, sortByScore } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

type GameOverScreenProps = {
  players: Player[];
  onPlayAgain: () => void;
  onNewPlayers: () => void;
};

/**
 * Lightweight confetti-style decoration rendered as animated colored circles.
 */
function ConfettiDots() {
  const dots = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      color: theme.colors.playerColors[i % theme.colors.playerColors.length],
      left: `${8 + Math.random() * 84}%` as const,
      delay: Math.random() * 600,
      anim: new Animated.Value(0),
      xOffset: (Math.random() - 0.5) * 60,
    })),
  ).current;

  useEffect(() => {
    dots.forEach((dot) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot.anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            delay: dot.delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot.anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [dots]);

  return (
    <>
      {dots.map((dot) => {
        const translateY = dot.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 500],
        });
        const opacity = dot.anim.interpolate({
          inputRange: [0, 0.3, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        });
        const rotate = dot.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${180 + Math.random() * 180}deg`],
        });
        return (
          <Animated.View
            key={dot.id}
            pointerEvents="none"
            style={[
              styles.confettiDot,
              {
                backgroundColor: dot.color,
                left: dot.left,
                opacity,
                transform: [
                  { translateY },
                  { translateX: dot.xOffset },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </>
  );
}

export function GameOverScreen({
  players,
  onPlayAgain,
  onNewPlayers,
}: GameOverScreenProps) {
  const headerFade = useRef(new Animated.Value(0)).current;
  const winnerScale = useRef(new Animated.Value(0.6)).current;
  const winnerFade = useRef(new Animated.Value(0)).current;
  const boardFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const sorted = sortByScore(players);
  const winner = sorted[0];

  useEffect(() => {
    triggerHaptic('success');

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(winnerFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(winnerScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 6,
          bounciness: 12,
        }),
      ]),
      Animated.timing(boardFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle winner pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [headerFade, winnerFade, winnerScale, boardFade, buttonFade, pulseAnim]);

  return (
    <View style={styles.container}>
      <ConfettiDots />

      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.gameOverText}>Game Over!</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.winnerCard,
          {
            opacity: winnerFade,
            transform: [
              { scale: Animated.multiply(winnerScale, pulseAnim) },
            ],
          },
        ]}
      >
        <Text style={styles.crownEmoji}>{'\uD83D\uDC51'}</Text>
        <View
          style={[styles.winnerColorDot, { backgroundColor: winner.color }]}
        />
        <Text style={styles.winnerName}>{winner.name}</Text>
        <Text style={styles.winnerScore}>{winner.score} points</Text>
        <Text style={styles.winnerLabel}>The Hottest Takes!</Text>
      </Animated.View>

      <Animated.View style={[styles.boardContainer, { opacity: boardFade }]}>
        <ScoreBoard players={players} title="Final Standings" />
      </Animated.View>

      <Animated.View style={[styles.buttons, { opacity: buttonFade }]}>
        <HooferButton
          title="Play Again"
          onPress={() => {
            triggerHaptic('medium');
            onPlayAgain();
          }}
          variant="primary"
          size="lg"
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <HooferButton
          title="New Players"
          onPress={() => {
            triggerHaptic('light');
            onNewPlayers();
          }}
          variant="ghost"
          size="md"
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
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  gameOverText: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  winnerCard: {
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...theme.shadow,
  },
  crownEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  winnerColorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
  },
  winnerName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
  },
  winnerScore: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#D4A017',
    marginTop: theme.spacing.xs,
  },
  winnerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  boardContainer: {
    flex: 1,
  },
  buttons: {
    paddingTop: theme.spacing.md,
  },
  buttonSpacer: {
    height: theme.spacing.sm,
  },
  // ── Confetti dots ───────
  confettiDot: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
