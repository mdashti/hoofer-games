import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@hoofer-games/shared';

type TimerBarProps = {
  progress: Animated.Value;
  height?: 'sm' | 'md' | 'lg';
};

const heightMap = {
  sm: 6,
  md: 12,
  lg: 20,
};

export function TimerBar({ progress, height = 'md' }: TimerBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barHeight = heightMap[height];

  // Interpolate color from green -> yellow -> red
  const barColor = progress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [
      theme.colors.error,
      theme.colors.error,
      theme.colors.accent,
      theme.colors.success,
    ],
  });

  // Interpolate width as percentage
  const widthPercent = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Pulse when progress is low
  useEffect(() => {
    const listenerId = progress.addListener(({ value }) => {
      if (value < 0.2 && value > 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => {
      progress.removeListener(listenerId);
    };
  }, [progress, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { height: barHeight, transform: [{ scaleY: pulseAnim }] },
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            width: widthPercent,
            height: barHeight,
            backgroundColor: barColor,
            borderRadius: barHeight / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
