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
  ScoreBoard,
  GameShell,
  triggerHaptic,
  sortByScore,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

type GameOverScreenProps = {
  players: Player[];
  onPlayAgain: () => void;
  onNewPlayers: () => void;
};

function ConfettiDot({
  color,
  delay,
  startX,
  startY,
}: {
  color: string;
  delay: number;
  startX: number;
  startY: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000 + Math.random() * 1000,
        delay: delay,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confettiDot,
        {
          backgroundColor: color,
          left: startX,
          top: startY,
          opacity: anim.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
            },
            {
              translateX: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
              }),
            },
            {
              rotate: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${Math.random() * 360}deg`],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export function GameOverScreen({
  players,
  onPlayAgain,
  onNewPlayers,
}: GameOverScreenProps) {
  const sorted = sortByScore(players);
  const winner = sorted[0];
  const screen = Dimensions.get('window');

  const crownAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerHaptic('success');

    Animated.stagger(300, [
      Animated.spring(crownAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 6,
        bounciness: 12,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonsAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  // Generate confetti dots using winner's color + other player colors
  const confettiColors = players.map((p) => p.color);
  const confettiDots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random() * 1500,
    startX: Math.random() * screen.width,
    startY: -20 - Math.random() * 40,
  }));

  return (
    <GameShell>
      <View style={styles.container}>
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {confettiDots.map((dot) => (
            <ConfettiDot
              key={dot.id}
              color={dot.color}
              delay={dot.delay}
              startX={dot.startX}
              startY={dot.startY}
            />
          ))}
        </View>

        {/* Winner celebration */}
        <Animated.View
          style={[
            styles.winnerSection,
            {
              opacity: crownAnim,
              transform: [
                {
                  scale: crownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.crownEmoji}>&#9733;</Text>
          <View
            style={[
              styles.winnerBadge,
              { backgroundColor: winner.color },
            ]}
          >
            <Text style={styles.winnerLabel}>WINNER</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerScore}>{winner.score} pts</Text>
          </View>
        </Animated.View>

        {/* Scoreboard */}
        <Animated.View
          style={[
            styles.scoreSection,
            { opacity: contentAnim },
          ]}
        >
          <ScoreBoard
            players={sorted}
            title="Final Standings"
            showRank
          />
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
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
          <View style={styles.buttonGap} />
          <HooferButton
            title="New Players"
            onPress={() => {
              triggerHaptic('medium');
              onNewPlayers();
            }}
            variant="ghost"
            size="md"
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
    minHeight: Dimensions.get('window').height - 100,
    gap: theme.spacing.lg,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  confettiDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  winnerSection: {
    alignItems: 'center',
    zIndex: 1,
  },
  crownEmoji: {
    fontSize: 48,
    color: '#FFD700',
    marginBottom: theme.spacing.sm,
  },
  winnerBadge: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl + 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  winnerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: theme.fontSize.title,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: theme.spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  winnerScore: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
  },
  scoreSection: {
    zIndex: 1,
  },
  buttonSection: {
    paddingHorizontal: theme.spacing.md,
    zIndex: 1,
  },
  buttonGap: {
    height: theme.spacing.sm,
  },
});
