import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GameShell, HooferButton, theme } from '@hoofer-games/shared';

type TitleScreenProps = {
  onPlay: () => void;
};

export function TitleScreen({ onPlay }: TitleScreenProps) {
  const [modeLabel, setModeLabel] = useState<'CORRECT?' | 'WRONG?'>('CORRECT?');
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  // Title bounce-in
  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 14,
    }).start();

    Animated.timing(subtitleFade, {
      toValue: 1,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim, subtitleFade]);

  // Flip mode label every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setModeLabel((prev) => (prev === 'CORRECT?' ? 'WRONG?' : 'CORRECT?'));

      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    flipAnim.setValue(1);
    return () => clearInterval(interval);
  }, [flipAnim]);

  const isWrong = modeLabel === 'WRONG?';
  const modeBg = isWrong ? theme.colors.error : theme.colors.success;

  return (
    <GameShell>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.titleArea,
            {
              transform: [{ scale: bounceAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{'🧠'}</Text>
          <Text style={styles.title}>MAYBE</Text>
          <Text style={styles.titleAccent}>OPPOSITE</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.modeBadge,
            { backgroundColor: modeBg },
            {
              opacity: flipAnim,
              transform: [{ scaleY: flipAnim }],
            },
          ]}
        >
          <Text style={styles.modeBadgeText}>{modeLabel}</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleArea, { opacity: subtitleFade }]}>
          <Text style={styles.subtitle}>
            Trust Nothing. Question Everything.
          </Text>
        </Animated.View>

        <View style={styles.buttonArea}>
          <HooferButton
            title="Play"
            onPress={onPlay}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
    width: '100%',
  },
  titleArea: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: 4,
  },
  titleAccent: {
    fontSize: theme.fontSize.title + 4,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.primary,
    letterSpacing: 6,
  },
  modeBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: 2,
  },
  subtitleArea: {
    paddingHorizontal: theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonArea: {
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
});
