import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { addDays } from "date-fns";
import { TodoItem } from "../types/todo";

// Как показывать уведомление когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const getEffectiveReminderDate = (date: Date): Date => {
  if (date <= new Date()) {
    return new Date(Date.now() + 60000);
  }
  return date;
};

export const scheduleNotification = async (
  title: string,
  body: string,
  date: Date,
): Promise<{ notificationId: string | undefined; adjustedDate: Date }> => {
  const effectiveDate = getEffectiveReminderDate(date);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📋 ${title}`,
        body,
        sound: true,
        data: { date: effectiveDate.toISOString() },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: effectiveDate,
        ...(Platform.OS === "android" && { exact: true }),
      },
    });

    return { notificationId: id, adjustedDate: effectiveDate };
  } catch (e) {
    Alert.alert("Ошибка уведомления", "Не удалось запланировать уведомление. Попробуйте ещё раз.");
    return { notificationId: undefined, adjustedDate: effectiveDate };
  }
};

export const cancelNotification = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const rescheduleNextNotification = async (todo: TodoItem): Promise<{ notificationId: string | undefined; adjustedDate: Date | undefined }> => {
  if (todo.notificationId) {
    await cancelNotification(todo.notificationId);
  }

  if (!todo.reminderDate) {
    return { notificationId: undefined, adjustedDate: undefined };
  }

  let nextDate = new Date(todo.reminderDate);
  if (todo.repeatFrequency && todo.nextDate) {
    const nextNextDate = addDays(new Date(todo.nextDate), todo.repeatFrequency);
    nextDate.setFullYear(nextNextDate.getFullYear());
    nextDate.setMonth(nextNextDate.getMonth());
    nextDate.setDate(nextNextDate.getDate());
  }

  const effectiveDate = getEffectiveReminderDate(nextDate);

  const { notificationId } = await scheduleNotification(todo.title, todo.description || "Напоминание о задаче", effectiveDate);

  return { notificationId, adjustedDate: effectiveDate };
};

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    requestPermissions();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Уведомление получено:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Пользователь нажал на уведомление:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (!Device.isDevice) {
      console.warn("Уведомления работают только на реальном устройстве");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Разрешите уведомления в настройках");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("tasks", {
        name: "Задачи",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    setPermissionGranted(true);
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    permissionGranted,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    rescheduleNextNotification,
  };
}
