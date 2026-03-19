import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import {
  theme,
  HooferButton,
  PlayerSetup,
  triggerHaptic,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

type SetupScreenProps = {
  players: Player[];
  totalRounds: number;
  onAddPlayer: (name: string, color: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onSetRounds: (rounds: number) => void;
  onStart: () => void;
  onBack: () => void;
};

const ROUND_OPTIONS = [3, 5, 7] as const;

export function SetupScreen({
  players,
  totalRounds,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onSetRounds,
  onStart,
  onBack,
}: SetupScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const canStart = players.length >= 2;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <PlayerSetup
        players={players}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
        onUpdatePlayer={onUpdatePlayer}
        minPlayers={2}
        maxPlayers={8}
      />

      <View style={styles.roundsSection}>
        <Text style={styles.roundsLabel}>Number of Rounds</Text>
        <View style={styles.roundsRow}>
          {ROUND_OPTIONS.map((n) => {
            const isSelected = totalRounds === n;
            return (
              <Pressable
                key={n}
                onPress={() => {
                  triggerHaptic('light');
                  onSetRounds(n);
                }}
                style={[
                  styles.roundOption,
                  isSelected && styles.roundOptionSelected,
                ]}
                accessibilityLabel={`${n} rounds`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.roundOptionText,
                    isSelected && styles.roundOptionTextSelected,
                  ]}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <HooferButton
          title="Start Game"
          onPress={onStart}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canStart}
        />
        <View style={styles.buttonSpacer} />
        <HooferButton
          title="Back"
          onPress={onBack}
          variant="ghost"
          size="md"
          fullWidth
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  roundsSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  roundsLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  roundsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  roundOption: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow,
  },
  roundOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '12',
  },
  roundOptionText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
  },
  roundOptionTextSelected: {
    color: theme.colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  buttonSpacer: {
    height: theme.spacing.sm,
  },
});
