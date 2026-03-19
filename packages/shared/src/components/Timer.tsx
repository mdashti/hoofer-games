import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { theme } from '../theme';

type TimerSize = 'sm' | 'md' | 'lg';

type TimerProps = {
  duration: number;
  onComplete?: () => void;
  isRunning: boolean;
  size?: TimerSize;
};

const sizeConfig: Record<TimerSize, { outer: number; inner: number; fontSize: number; stroke: number }> = {
  sm: { outer: 80, inner: 68, fontSize: theme.fontSize.lg, stroke: 6 },
  md: { outer: 140, inner: 120, fontSize: theme.fontSize.xxl, stroke: 10 },
  lg: { outer: 200, inner: 172, fontSize: theme.fontSize.title, stroke: 14 },
};

function getTimerColor(fraction: number): string {
  if (fraction > 0.5) return theme.colors.success;
  if (fraction > 0.2) return theme.colors.accent;
  return theme.colors.error;
}

export function Timer({
  duration,
  onComplete,
  isRunning,
  size = 'md',
}: TimerProps) {
  const secondsLeft = useRef(duration);
  const [displaySeconds, setDisplaySeconds] = React.useState(duration);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const config = sizeConfig[size];
  const fraction = displaySeconds / duration;
  const timerColor = getTimerColor(fraction);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pulse when under 5 seconds
  useEffect(() => {
    if (displaySeconds <= 5 && displaySeconds > 0 && isRunning) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 12,
        }),
      ]).start();
    }
  }, [displaySeconds, isRunning, pulseAnim]);

  // Countdown logic
  useEffect(() => {
    if (isRunning) {
      secondsLeft.current = displaySeconds;
      intervalRef.current = setInterval(() => {
        secondsLeft.current -= 1;
        if (secondsLeft.current <= 0) {
          secondsLeft.current = 0;
          setDisplaySeconds(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onCompleteRef.current?.();
        } else {
          setDisplaySeconds(secondsLeft.current);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Reset when duration changes
  useEffect(() => {
    secondsLeft.current = duration;
    setDisplaySeconds(duration);
  }, [duration]);

  // Progress ring using bordered views (cross-platform, no SVG needed)
  // We approximate a circular progress by rendering a ring with a colored arc
  const progressDeg = (1 - fraction) * 360;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.outerRing,
          {
            width: config.outer,
            height: config.outer,
            borderRadius: config.outer / 2,
            borderWidth: config.stroke,
            borderColor: timerColor + '25',
          },
        ]}
      >
        {/* Progress arc - top half */}
        {fraction > 0 && (
          <View
            style={[
              styles.progressOverlay,
              {
                width: config.outer,
                height: config.outer,
                borderRadius: config.outer / 2,
                borderWidth: config.stroke,
                borderColor: timerColor,
                borderTopColor: fraction > 0.75 ? timerColor : 'transparent',
                borderRightColor: fraction > 0.5 ? timerColor : 'transparent',
                borderBottomColor: fraction > 0.25 ? timerColor : 'transparent',
                borderLeftColor: fraction > 0 ? timerColor : 'transparent',
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        )}

        <View
          style={[
            styles.innerCircle,
            {
              width: config.inner,
              height: config.inner,
              borderRadius: config.inner / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.timeText,
              {
                fontSize: config.fontSize,
                color: displaySeconds <= 5 ? theme.colors.error : theme.colors.text,
              },
            ]}
          >
            {displaySeconds}
          </Text>
          {size !== 'sm' && (
            <Text style={styles.secondsLabel}>
              {displaySeconds === 1 ? 'second' : 'seconds'}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressOverlay: {
    position: 'absolute',
    top: -10, // account for border offset
    left: -10,
  },
  innerCircle: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
  },
  timeText: {
    fontWeight: theme.fontWeight.extrabold,
    fontVariant: ['tabular-nums'],
  },
  secondsLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
});
