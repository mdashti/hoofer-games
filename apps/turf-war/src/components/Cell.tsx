import React, { useRef, useEffect, memo } from 'react';
import { Pressable, Animated, StyleSheet, View } from 'react-native';
import type { CellState } from '../types';

type CellProps = {
  cell: CellState;
  size: number;
  onTap: () => void;
  disabled: boolean;
};

const EMPTY_COLOR = '#E8ECF0';
const BORDER_COLOR = '#D1D5DB';
const GAP = 2;

function CellInner({ cell, size, onTap, disabled }: CellProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(cell.owner ? 1 : 0)).current;
  const prevOwnerRef = useRef(cell.owner);
  const prevContestedRef = useRef(cell.contested);

  useEffect(() => {
    const ownerChanged = prevOwnerRef.current !== cell.owner;
    const contestedChanged = prevContestedRef.current !== cell.contested;

    if (ownerChanged || contestedChanged) {
      // Quick scale pop animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 12,
        }),
      ]).start();
    }

    prevOwnerRef.current = cell.owner;
    prevContestedRef.current = cell.contested;
  }, [cell.owner, cell.contested, scaleAnim]);

  const cellSize = size - GAP;

  const backgroundColor = cell.color
    ? cell.color
    : EMPTY_COLOR;

  const opacity = cell.contested ? 0.4 : 1;

  return (
    <Animated.View
      style={[
        {
          width: cellSize,
          height: cellSize,
          margin: GAP / 2,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onTap}
        style={[
          styles.cell,
          {
            backgroundColor,
            opacity,
            borderRadius: 4,
          },
        ]}
        disabled={disabled}
      >
        {cell.contested && (
          <View style={styles.contestedOverlay}>
            <View style={styles.crackLine} />
            <View style={[styles.crackLine, styles.crackLine2]} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contestedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crackLine: {
    position: 'absolute',
    width: '60%',
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  crackLine2: {
    transform: [{ rotate: '-45deg' }],
  },
});

export const Cell = memo(CellInner);
