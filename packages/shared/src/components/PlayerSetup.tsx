import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { Player } from '../types';
import { HooferButton } from './HooferButton';
import { triggerHaptic } from '../utils/haptics';

type PlayerSetupProps = {
  players: Player[];
  onAddPlayer: (name: string, color: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  minPlayers: number;
  maxPlayers: number;
};

function ColorPicker({
  selectedColor,
  usedColors,
  onSelect,
}: {
  selectedColor: string;
  usedColors: string[];
  onSelect: (color: string) => void;
}) {
  return (
    <View style={styles.colorRow}>
      {theme.colors.playerColors.map((color) => {
        const isUsed = usedColors.includes(color) && color !== selectedColor;
        const isSelected = color === selectedColor;
        return (
          <Pressable
            key={color}
            onPress={() => {
              if (!isUsed) {
                triggerHaptic('light');
                onSelect(color);
              }
            }}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              isUsed && styles.colorCircleUsed,
              isSelected && styles.colorCircleSelected,
            ]}
            accessibilityLabel={`Color ${color}`}
            accessibilityState={{ selected: isSelected, disabled: isUsed }}
          >
            {isSelected && <View style={styles.colorCheckmark} />}
            {isUsed && <View style={styles.colorStrike} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function PlayerRow({
  player,
  onRemove,
  canRemove,
}: {
  player: Player;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.playerRow,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={[styles.playerColor, { backgroundColor: player.color }]} />
      <Text style={styles.playerName} numberOfLines={1}>
        {player.name}
      </Text>
      {canRemove && (
        <Pressable
          onPress={() => {
            triggerHaptic('light');
            onRemove();
          }}
          style={styles.removeButton}
          accessibilityLabel={`Remove ${player.name}`}
          hitSlop={8}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

export function PlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  minPlayers,
  maxPlayers,
}: PlayerSetupProps) {
  const [inputName, setInputName] = useState('');
  const [selectedColor, setSelectedColor] = useState(() => {
    const usedColors = players.map((p) => p.color);
    return (
      theme.colors.playerColors.find((c) => !usedColors.includes(c)) ??
      theme.colors.playerColors[0]
    );
  });
  const inputRef = useRef<TextInput>(null);

  const usedColors = players.map((p) => p.color);
  const canAdd = players.length < maxPlayers;
  const canRemove = players.length > minPlayers;

  const handleAdd = useCallback(() => {
    const trimmed = inputName.trim();
    if (!trimmed || !canAdd) return;

    triggerHaptic('medium');
    onAddPlayer(trimmed, selectedColor);
    setInputName('');

    // Auto-select next available color
    const nowUsed = [...usedColors, selectedColor];
    const next = theme.colors.playerColors.find((c) => !nowUsed.includes(c));
    if (next) setSelectedColor(next);

    inputRef.current?.focus();
  }, [inputName, selectedColor, canAdd, onAddPlayer, usedColors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Players</Text>
      <Text style={styles.subtitle}>
        {players.length} / {maxPlayers} players
        {players.length < minPlayers
          ? ` (need at least ${minPlayers})`
          : ''}
      </Text>

      <ScrollView
        style={styles.playerList}
        contentContainerStyle={styles.playerListContent}
        showsVerticalScrollIndicator={false}
      >
        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onRemove={() => onRemovePlayer(player.id)}
            canRemove={canRemove}
          />
        ))}
      </ScrollView>

      {canAdd && (
        <View style={styles.addSection}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.nameInput}
              value={inputName}
              onChangeText={setInputName}
              placeholder="Enter player name..."
              placeholderTextColor={theme.colors.textLight}
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              autoCorrect={false}
            />
          </View>

          <ColorPicker
            selectedColor={selectedColor}
            usedColors={usedColors}
            onSelect={setSelectedColor}
          />

          <View style={styles.addButtonContainer}>
            <HooferButton
              title="+ Add Player"
              onPress={handleAdd}
              variant="secondary"
              size="md"
              disabled={!inputName.trim()}
              fullWidth
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  playerList: {
    maxHeight: 280,
  },
  playerListContent: {
    gap: theme.spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadow,
  },
  playerColor: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
  },
  playerName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  addSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.secondary + '40',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleUsed: {
    opacity: 0.3,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: theme.colors.text,
  },
  colorCheckmark: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#FFFFFF',
  },
  colorStrike: {
    width: 24,
    height: 3,
    backgroundColor: '#FFFFFF80',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  addButtonContainer: {
    marginTop: theme.spacing.xs,
  },
});
