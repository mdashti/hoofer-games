import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  GameShell,
  HooferButton,
  PlayerSetup,
  theme,
  triggerHaptic,
  generateId,
} from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';
import type { GameMode, MaybeOppositeConfig } from '../types';

type SetupScreenProps = {
  mode: GameMode;
  onStart: (players: Player[], config: MaybeOppositeConfig) => void;
  onBack: () => void;
};

const modeLabels: Record<GameMode, string> = {
  classic: 'Classic Mode',
  combo: 'Combo Mode',
  betrayal: 'Group Betrayal',
  kid: 'Kid Mode',
};

const modeEmojis: Record<GameMode, string> = {
  classic: '🔄',
  combo: '⚡',
  betrayal: '🕵️',
  kid: '🎈',
};

const minPlayersForMode: Record<GameMode, number> = {
  classic: 2,
  combo: 1,
  betrayal: 4,
  kid: 2,
};

const maxPlayersForMode: Record<GameMode, number> = {
  classic: 8,
  combo: 8,
  betrayal: 8,
  kid: 8,
};

function OptionSelector({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: number; label: string }[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.optionContainer}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => {
          const isSelected = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                triggerHaptic('light');
                onSelect(opt.value);
              }}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isSelected && styles.optionButtonTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SetupScreen({ mode, onStart, onBack }: SetupScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [questionsPerPlayer, setQuestionsPerPlayer] = useState(10);
  const [totalRounds, setTotalRounds] = useState(5);

  const minPlayers = minPlayersForMode[mode];
  const maxPlayers = maxPlayersForMode[mode];
  const canStart = players.length >= minPlayers;

  const handleAddPlayer = (name: string, color: string) => {
    const newPlayer: Player = {
      id: generateId(),
      name,
      color,
      score: 0,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const handleStart = () => {
    triggerHaptic('success');
    const config: MaybeOppositeConfig = {
      gameMode: mode,
      questionsPerPlayer,
      totalRounds,
      timerDuration: mode === 'kid' ? 5 : 3,
    };
    onStart(players, config);
  };

  return (
    <GameShell title="Setup" showBack onBack={onBack}>
      <View style={styles.container}>
        <View style={styles.modeBanner}>
          <Text style={styles.modeEmoji}>{modeEmojis[mode]}</Text>
          <Text style={styles.modeLabel}>{modeLabels[mode]}</Text>
        </View>

        <PlayerSetup
          players={players}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onUpdatePlayer={handleUpdatePlayer}
          minPlayers={minPlayers}
          maxPlayers={maxPlayers}
        />

        {(mode === 'classic' || mode === 'kid') && (
          <OptionSelector
            label="Questions per player"
            options={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 15, label: '15' },
            ]}
            selected={questionsPerPlayer}
            onSelect={setQuestionsPerPlayer}
          />
        )}

        {mode === 'betrayal' && (
          <OptionSelector
            label="Number of rounds"
            options={[
              { value: 3, label: '3' },
              { value: 5, label: '5' },
              { value: 8, label: '8' },
            ]}
            selected={totalRounds}
            onSelect={setTotalRounds}
          />
        )}

        <View style={styles.startButtonArea}>
          <HooferButton
            title="Start Game"
            onPress={handleStart}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStart}
          />
          {!canStart && (
            <Text style={styles.needMoreText}>
              Need at least {minPlayers} player{minPlayers > 1 ? 's' : ''}
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
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  modeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow,
  },
  modeEmoji: {
    fontSize: 24,
  },
  modeLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  optionContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  optionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow,
  },
  optionButtonSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + '15',
  },
  optionButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textLight,
  },
  optionButtonTextSelected: {
    color: theme.colors.secondary,
  },
  startButtonArea: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  needMoreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
