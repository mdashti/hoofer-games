import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { Player } from '@hoofer-games/shared';
import type { CellState } from '../types';
import { Cell } from './Cell';

type GridProps = {
  rows: number;
  cols: number;
  cells: CellState[][];
  currentPlayer: Player;
  onCellTap: (row: number, col: number) => void;
  disabled: boolean;
  maxWidth?: number;
  maxHeight?: number;
};

function GridInner({
  rows,
  cols,
  cells,
  currentPlayer,
  onCellTap,
  disabled,
  maxWidth,
  maxHeight,
}: GridProps) {
  const screen = Dimensions.get('window');
  const availableWidth = maxWidth ?? screen.width - 16;
  const availableHeight = maxHeight ?? screen.height * 0.6;

  // Calculate cell size to fit grid within available space
  const cellSize = Math.floor(
    Math.min(availableWidth / cols, availableHeight / rows),
  );

  // Ensure minimum tap target
  const finalCellSize = Math.max(cellSize, 36);

  const gridWidth = finalCellSize * cols;

  // Memoize row rendering to avoid unnecessary re-renders
  const gridRows = useMemo(() => {
    return cells.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            size={finalCellSize}
            onTap={() => onCellTap(rowIndex, colIndex)}
            disabled={disabled}
          />
        ))}
      </View>
    ));
  }, [cells, finalCellSize, onCellTap, disabled]);

  return (
    <View style={[styles.container, { width: gridWidth }]}>
      {gridRows}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#C8CDD3',
    padding: 1,
  },
  row: {
    flexDirection: 'row',
  },
});

export const Grid = memo(GridInner);
