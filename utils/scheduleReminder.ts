import * as Notifications from "expo-notifications";

export async function scheduleReminder(
  todoId: number,
  title: string,
  date: Date,
) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Напоминание",
      body: title,

      data: {
        todoId,
      },
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return notificationId;
}
