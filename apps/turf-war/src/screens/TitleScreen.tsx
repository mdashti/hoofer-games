import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme, HooferButton, GameShell, triggerHaptic } from '@hoofer-games/shared';

type TitleScreenProps = {
  onStartGame: () => void;
};

const GRID_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A855F7',
  '#3B82F6',
  '#F97316',
];

const GRID_ROWS = 6;
const GRID_COLS = 5;

function AnimatedGridBackground() {
  const screen = Dimensions.get('window');
  const cellSize = Math.floor(screen.width / (GRID_COLS + 1));
  const anims = useRef(
    Array.from({ length: GRID_ROWS * GRID_COLS }, () => new Animated.Value(0)),
  ).current;
  const colorIndices = useRef(
    Array.from({ length: GRID_ROWS * GRID_COLS }, () =>
      Math.floor(Math.random() * GRID_COLORS.length),
    ),
  ).current;

  useEffect(() => {
    const animateCell = (index: number) => {
      const delay = Math.random() * 3000;

      setTimeout(() => {
        // Pick a new random color
        colorIndices[index] = Math.floor(Math.random() * GRID_COLORS.length);

        Animated.sequence([
          Animated.timing(anims[index], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anims[index], {
            toValue: 0.15,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          animateCell(index);
        });
      }, delay);
    };

    anims.forEach((_, i) => animateCell(i));
  }, []);

  const offsetX = (screen.width - cellSize * GRID_COLS) / 2;

  return (
    <View style={[styles.gridBg, { paddingLeft: offsetX }]}>
      {Array.from({ length: GRID_ROWS }, (_, row) => (
        <View key={row} style={styles.gridRow}>
          {Array.from({ length: GRID_COLS }, (_, col) => {
            const idx = row * GRID_COLS + col;
            return (
              <Animated.View
                key={col}
                style={[
                  styles.gridCell,
                  {
                    width: cellSize - 4,
                    height: cellSize - 4,
                    margin: 2,
                    backgroundColor: GRID_COLORS[colorIndices[idx]],
                    opacity: anims[idx],
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function TitleScreen({ onStartGame }: TitleScreenProps) {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(titleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 10,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  return (
    <GameShell>
      <View style={styles.container}>
        <AnimatedGridBackground />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleAnim,
                transform: [
                  {
                    scale: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.iconGrid}>
              <View style={[styles.iconCell, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.iconCell, { backgroundColor: '#4ECDC4' }]} />
              <View style={[styles.iconCell, { backgroundColor: '#FFE66D' }]} />
              <View style={[styles.iconCell, { backgroundColor: '#A855F7' }]} />
            </View>
            <Text style={styles.title}>TURF</Text>
            <Text style={styles.titleWar}>WAR</Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleAnim }}>
            <Text style={styles.subtitle}>Claim Your Territory!</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <HooferButton
              title="New Game"
              onPress={() => {
                triggerHaptic('medium');
                onStartGame();
              }}
              variant="primary"
              size="lg"
              fullWidth
            />
          </Animated.View>
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - 100,
  },
  gridBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    borderRadius: 6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 68,
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  iconCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 6,
    lineHeight: 76,
  },
  titleWar: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 10,
    lineHeight: 76,
    marginTop: -8,
  },
  subtitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: theme.spacing.xl,
  },
});
