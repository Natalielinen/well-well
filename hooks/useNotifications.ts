import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert, Platform } from "react-native";
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

export const scheduleNotification = async (
  title: string,
  body: string,
  date: Date,
): Promise<{ notificationId: string | undefined }> => {
  if (date.getTime() <= Date.now()) {
    return { notificationId: undefined };
  }
  if (!Number.isFinite(date.getTime())) {
    throw new Error("Invalid reminder date");
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Notification permission not granted");
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📋 ${title}`,
        body,
        sound: true,
        data: { date: date.toISOString() },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        ...(Platform.OS === "android" && { exact: true }),
      },
    });

    return { notificationId: id };
  } catch (e) {
    throw e;
  }
};

export const cancelNotification = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const notifyReminderFailed = async (): Promise<void> => {
  let denied = false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    denied = status !== "granted";
  } catch {
    // Если причина неизвестна, показываем общее сообщение.
  }
  Alert.alert("Ошибка", denied
    ? "Задача сохранена. Напоминание не установлено: разрешите уведомления в настройках"
    : "Задача сохранена, но напоминание не установлено. Попробуйте задать его ещё раз");
};

export const rescheduleNextNotification = async (todo: TodoItem): Promise<{ notificationId: string | undefined }> => {
  if (todo.notificationId) {
    try {
      await cancelNotification(todo.notificationId);
    } catch {
      // Уже сработавшее уведомление не должно блокировать выполнение задачи.
    }
  }

  if (!todo.reminderDate) {
    return { notificationId: undefined };
  }

  // reminderDate уже указывает на следующее выполнение (её вычислил вызывающий
  // код в onTaskComplete). Здесь дату НЕ сдвигаем повторно — иначе уведомление
  // уезжает на repeatFrequency вперёд и накапливает сдвиг при каждом выполнении.
  const nextDate = new Date(todo.reminderDate);

  return scheduleNotification(todo.title, todo.description || "Напоминание о задаче", nextDate);
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
