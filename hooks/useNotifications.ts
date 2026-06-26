import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Как показывать уведомление когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // показывать баннер сверху
    shouldShowList: true, // показывать в центре уведомлений
  }),
});

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    requestPermissions();

    // Слушаем входящие уведомления
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Уведомление получено:", notification);
      });

    // Слушаем нажатие на уведомление
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

    // Для Android нужен канал
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

  // Запланировать уведомление на конкретное время
const scheduleNotification = async (
    title: string,
    body: string,
    date: Date,
): Promise<string | undefined> => {
    
    if (date <= new Date()) {
        console.log("❌ Дата в прошлом, уведомление не создано");
        return undefined;
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
                date: date,
                ...(Platform.OS === "android" && { exact: true }),
            },
        });

        return id;
    } catch (e) {
        console.error("❌ Ошибка:", e);
        return undefined;
    }
};

  // Отменить уведомление по id
  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  // Отменить все уведомления
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    permissionGranted,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  };
}
