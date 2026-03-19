import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type HooferButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: theme.colors.primary, text: '#FFFFFF' },
  secondary: { bg: theme.colors.secondary, text: '#FFFFFF' },
  accent: { bg: theme.colors.accent, text: theme.colors.text },
  ghost: { bg: 'transparent', text: theme.colors.text, border: theme.colors.textLight },
};

const sizeStyles: Record<ButtonSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: theme.spacing.md, paddingV: theme.spacing.sm, fontSize: theme.fontSize.sm },
  md: { paddingH: theme.spacing.lg, paddingV: theme.spacing.md, fontSize: theme.fontSize.md },
  lg: { paddingH: theme.spacing.xl, paddingV: theme.spacing.lg - 4, fontSize: theme.fontSize.lg },
};

export function HooferButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
}: HooferButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
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

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const buttonStyle: ViewStyle = {
    backgroundColor: disabled ? '#D5D8DC' : v.bg,
    paddingHorizontal: s.paddingH,
    paddingVertical: s.paddingV,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth ? { width: '100%' } : {}),
    ...(v.border ? { borderWidth: 2, borderColor: disabled ? '#D5D8DC' : v.border } : {}),
    ...(variant !== 'ghost' && !disabled ? theme.shadow : {}),
  };

  const textStyle: TextStyle = {
    color: disabled ? '#95A5A6' : v.text,
    fontSize: s.fontSize,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={buttonStyle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={textStyle}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
});
