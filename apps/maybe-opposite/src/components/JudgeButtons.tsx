import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { theme, triggerHaptic } from '@hoofer-games/shared';

type JudgeButtonsProps = {
  onCorrect: () => void;
  onWrong: () => void;
  disabled?: boolean;
};

function JudgeButton({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    triggerHaptic('medium');
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: disabled ? '#D5D8DC' : color },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function JudgeButtons({
  onCorrect,
  onWrong,
  disabled = false,
}: JudgeButtonsProps) {
  return (
    <View style={styles.container}>
      <JudgeButton
        label={'GOT IT RIGHT \u2713'}
        color={theme.colors.success}
        onPress={onCorrect}
        disabled={disabled}
      />
      <JudgeButton
        label={'GOT IT WRONG \u2717'}
        color={theme.colors.error}
        onPress={onWrong}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    ...theme.shadow,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
