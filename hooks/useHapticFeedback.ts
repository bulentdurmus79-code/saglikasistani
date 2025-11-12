
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useHapticFeedback = () => {
  const hapticFeedbackEnabled = useAppStore((state) => state.settings.hapticFeedback);

  const triggerHaptic = useCallback((pattern: VibratePattern = 50) => {
    if (hapticFeedbackEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Haptic feedback failed:", error);
      }
    }
  }, [hapticFeedbackEnabled]);

  return triggerHaptic;
};
