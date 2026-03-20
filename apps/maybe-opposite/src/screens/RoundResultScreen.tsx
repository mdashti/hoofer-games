import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GameShell, ScoreBoard, HooferButton, theme } from '@hoofer-games/shared';
import type { Player } from '@hoofer-games/shared';

type RoundResultScreenProps = {
  players: Player[];
  onNext: () => void;
};

export function RoundResultScreen({
  players,
  onNext,
}: RoundResultScreenProps) {
  return (
    <GameShell title="Results">
      <View style={styles.container}>
        <ScoreBoard players={players} title="Scores" showRank />

        <View style={styles.buttonArea}>
          <HooferButton
            title="See Final Results"
            onPress={onNext}
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
    width: '100%',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  buttonArea: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
});
