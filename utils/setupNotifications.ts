import * as Notifications from 'expo-notifications';

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    console.log('Нет разрешения на уведомления');
    return false;
  }

  return true;
}