import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Player } from '@hoofer-games/shared';
import { theme } from '@hoofer-games/shared';

type TerritoryBarProps = {
  players: Player[];
  counts: Map<string, number>;
};

function TerritoryBarInner({ players, counts }: TerritoryBarProps) {
  return (
    <View style={styles.container}>
      {players.map((player) => {
        const count = counts.get(player.id) || 0;
        return (
          <View key={player.id} style={styles.playerStat}>
            <View style={[styles.dot, { backgroundColor: player.color }]} />
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            <Text style={[styles.count, { color: player.color }]}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadow,
  },
  playerStat: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  name: {
    fontSize: 11,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    maxWidth: 60,
  },
  count: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    fontVariant: ['tabular-nums'] as any,
  },
});

export const TerritoryBar = memo(TerritoryBarInner);
