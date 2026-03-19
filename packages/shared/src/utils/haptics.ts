type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

/**
 * Triggers haptic feedback. Gracefully falls back to a no-op on web
 * or when expo-haptics is unavailable.
 */
export const triggerHaptic = (type: HapticType): void => {
  try {
    // Dynamic import so web builds don't crash
    const Haptics = require('expo-haptics');

    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Silently ignore - haptics not available (web, etc.)
  }
};
