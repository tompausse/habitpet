import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'HabitPet',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Schedule (or reschedule) a daily reminder at the given hour:minute. */
export async function scheduleDailyReminder(petName: string, hour = 20, minute = 0): Promise<void> {
  // Cancel any existing HabitPet reminders
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if ((n.content.data as any)?.source === 'habitpet-daily') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${petName} hat Hunger! 🐾`,
      body: 'Erledige heute mindestens einen Habit und halte deine Streak am Leben 🔥',
      data: { source: 'habitpet-daily' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
