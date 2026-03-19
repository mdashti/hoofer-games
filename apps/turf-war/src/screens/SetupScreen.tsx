import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  theme,
  PlayerSetup,
  HooferButton,
  GameShell,
  triggerHaptic,
  generateId,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { TurfWarConfig } from '../types';

type SetupScreenProps = {
  onStart: (players: Player[], config: TurfWarConfig) => void;
  onBack: () => void;
};

const ROUND_OPTIONS = [1, 3, 5];
const FRENZY_OPTIONS = [3, 5, 7];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

function OptionSelector({
  label,
  options,
  selected,
  onSelect,
  suffix,
}: {
  label: string;
  options: number[];
  selected: number;
  onSelect: (v: number) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => {
          const isSelected = opt === selected;
          return (
            <Pressable
              key={opt}
              onPress={() => {
                triggerHaptic('light');
                onSelect(opt);
              }}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt}{suffix ?? ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalRounds, setTotalRounds] = useState(3);
  const [frenzyTime, setFrenzyTime] = useState(5);

  const handleAddPlayer = useCallback((name: string, color: string) => {
    setPlayers((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        color,
        score: 0,
      },
    ]);
  }, []);

  const handleRemovePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleUpdatePlayer = useCallback(
    (id: string, updates: Partial<Player>) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const canStart = players.length >= MIN_PLAYERS;

  const handleStart = () => {
    if (!canStart) return;
    triggerHaptic('success');
    onStart(players, {
      totalRounds,
      frenzyTime,
      turnsPerRound: 3,
    });
  };

  return (
    <GameShell title="Game Setup" showBack onBack={onBack}>
      <View style={styles.container}>
        <PlayerSetup
          players={players}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onUpdatePlayer={handleUpdatePlayer}
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Game Options</Text>

        <OptionSelector
          label="Rounds"
          options={ROUND_OPTIONS}
          selected={totalRounds}
          onSelect={setTotalRounds}
        />

        <OptionSelector
          label="Frenzy Time"
          options={FRENZY_OPTIONS}
          selected={frenzyTime}
          onSelect={setFrenzyTime}
          suffix="s"
        />

        <View style={styles.startContainer}>
          <HooferButton
            title="Start Battle!"
            onPress={handleStart}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStart}
          />
          {!canStart && (
            <Text style={styles.hintText}>
              Add at least {MIN_PLAYERS} players to begin
            </Text>
          )}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.textLight + '30',
    marginVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  optionGroup: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  optionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow,
  },
  optionButtonSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '15',
  },
  optionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
  },
  optionTextSelected: {
    color: theme.colors.secondary,
  },
  startContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
