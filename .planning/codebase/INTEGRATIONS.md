# Внешние интеграции

*Последнее обновление: 2026-07-16*

## Резюме

Приложение **wellWell** («Ну дела!») — автономное мобильное приложение без backend. Все данные хранятся локально на устройстве. Внешних API-интеграций нет.

## Хранилище данных

| Сервис | Библиотека | Путь в коде | Назначение |
|--------|-----------|-------------|------------|
| AsyncStorage | `@react-native-async-storage/async-storage` | `storage/todoStorage.ts` | Локальное хранение задач в формате JSON |

- Ключ хранилища: `TODOS` (`storage/todoStorage.ts:4`)
- Полная CRUD-логика: `saveTodos`, `loadTodos`, `addTodo`, `removeTodo`, `updateTodo`
- Нет синхронизации с сервером, нет резервного копирования

## Реклама

| Сервис | Библиотека | Путь в коде | Назначение |
|--------|-----------|-------------|------------|
| Yandex Mobile Ads | `yandex-mobile-ads` | `App.tsx:28` | Баннерная реклама внизу экрана |

- Ad unit ID: `R-M-19204363-1` (hardcoded в `App.tsx:261`)
- Инициализация SDK: `MobileAds.initialize()` при старте (`App.tsx:79`)
- Размер баннера: `BannerAdSize.stickySize(width)` (`App.tsx:51`)
- Обработчики: `onAdLoaded` и `onAdFailedToLoad` (только `console.log`)

## Уведомления

| Сервис | Библиотека | Путь в коде | Назначение |
|--------|-----------|-------------|------------|
| Expo Notifications | `expo-notifications` | `hooks/useNotifications.ts` | Локальные push-уведомления о задачах |

- Канал на Android: `tasks` (HARD importance, вибрация, свет) (`hooks/useNotifications.ts:65`)
- Разрешения запрашиваются при первом запуске
- Планирование: `scheduleNotification` с `exact: true` на Android (`hooks/useNotifications.ts:99`)
- Отмена: `cancelNotification` по ID при удалении/обновлении задачи
- Нет серверных push-уведомлений, только локальные

## Аутентификация и авторизация

- **Нет.** Приложение не требует логина, регистрации или внешних провайдеров аутентификации.

## Аналитика и мониторинг

- **Нет.** В коде нет интеграции с аналитическими сервисами (Firebase, Amplitude и т.д.).

## API и веб-хуки

- **Нет.** Приложение работает полностью офлайн. REST/GraphQL/gRPC endpoints отсутствуют.
