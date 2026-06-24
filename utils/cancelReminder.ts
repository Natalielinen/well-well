import * as Notifications from "expo-notifications";

export async function cancelReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}