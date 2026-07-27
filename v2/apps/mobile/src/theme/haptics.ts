/**
 * Vocabulario háptico — tres gestos, nada más.
 * tick: elegir algo. send: entregar algo. celebrate: lograr algo.
 */
import * as Haptics from 'expo-haptics';

export const haptic = {
  tick: () => Haptics.selectionAsync().catch(() => {}),
  send: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  celebrate: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};
