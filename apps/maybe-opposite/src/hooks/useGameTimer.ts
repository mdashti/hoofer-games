import { useRef, useState, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
import { triggerHaptic } from '@hoofer-games/shared';

export function useGameTimer(duration: number, onComplete: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const progress = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const onCompleteRef = useRef(onComplete);
  const hasTickedRef = useRef(false);
  const durationRef = useRef(duration);

  onCompleteRef.current = onComplete;
  durationRef.current = duration;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsRunning(false);
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setIsRunning(false);
    setTimeRemaining(durationRef.current);
    progress.setValue(1);
    hasTickedRef.current = false;
  }, [cleanup, progress]);

  const start = useCallback(() => {
    cleanup();
    hasTickedRef.current = false;
    setTimeRemaining(durationRef.current);
    progress.setValue(1);
    setIsRunning(true);

    // Smooth bar animation
    animRef.current = Animated.timing(progress, {
      toValue: 0,
      duration: durationRef.current * 1000,
      useNativeDriver: false,
    });
    animRef.current.start();

    // Countdown interval
    let remaining = durationRef.current;
    intervalRef.current = setInterval(() => {
      remaining -= 0.1;

      if (remaining <= 1 && !hasTickedRef.current) {
        hasTickedRef.current = true;
        triggerHaptic('medium');
      }

      if (remaining <= 0) {
        cleanup();
        setTimeRemaining(0);
        setIsRunning(false);
        triggerHaptic('error');
        onCompleteRef.current();
      } else {
        setTimeRemaining(Math.ceil(remaining * 10) / 10);
      }
    }, 100);
  }, [cleanup, progress]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    progress,
    timeRemaining,
    isRunning,
    start,
    stop,
    reset,
  };
}
