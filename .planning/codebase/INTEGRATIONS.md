---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
# Внешние интеграции

**Analysis Date:** 2026-10-24

## API и внешние сервисы

**Рекламная сеть:**
- Yandex Mobile Ads SDK - показ баннерной рекламы
  - SDK/Client: `yandex-mobile-ads` `^8.0.0`
  - Инициализация: `MobileAds.initialize()` в `useEffect` при монтировании `App` (`App.tsx`, около строки 84)
  - Отображение: компонент `BannerView` с `adUnitId: "R-M-19204363-1"` и размером `BannerAdSize.stickySize(width)` (`App.tsx`, около строк 43 и 189-192)
  - Auth: не требуется на стороне приложения; Ad Unit ID захардкожен в `App.tsx`
  - Политика конфиденциальности/согласия (GDPR/ATT) в коде не настраивается перед `initialize()`. Комментарий в `App.tsx` говорит о настройке политики до инициализации, но никакого кода для этого нет.

**Внешних API данных, REST/GraphQL-клиентов, HTTP-запросов (`fetch`, `axios`) в исходниках не обнаружено.**

## Хранение данных

**Базы данных:**
- Не используются. Внешних БД и ORM нет.

**Локальное хранилище:**
- AsyncStorage - единственное хранилище данных задач
  - Клиент: `@react-native-async-storage/async-storage` `2.2.0`
  - Реализация: `storage/todoStorage.ts`
  - Ключ: `TODOS`, значение - JSON-массив `TodoItem[]`
  - Операции: `loadTodos`, `saveTodos`, `addTodo`, `removeTodo`, `updateTodo`
  - Типы данных: `types/todo.ts`

**Файловое хранилище:**
- Только локальные ресурсы из `assets/` (`icon.png`, `splash-icon.png`). Пользовательские файлы не сохраняются.

**Кэширование:**
- Отдельного слоя кэширования нет. Данные читаются из AsyncStorage при загрузке через `hooks/useTodos.ts`.

## Аутентификация и идентификация

**Провайдер аутентификации:**
- Не используется. Аккаунтов пользователей и входа нет, все данные хранятся на устройстве.

**Идентификаторы задач:**
- Числовой `id` генерируется приложением (см. `types/todo.ts`). Внешних идентификаторов нет.

## Уведомления

**Локальные уведомления (Expo):**
- `expo-notifications` `~0.32.17` - планирование и отображение локальных напоминаний
  - Реализация: `hooks/useNotifications.ts`
  - Функции: `scheduleNotification`, `cancelNotification`, `cancelAllNotifications`, `rescheduleNextNotification`
  - Триггер: тип `DATE`, на Android дополнительно `exact: true` (требует разрешение `SCHEDULE_EXACT_ALARM` из `app.json`)
  - Канал Android: id `tasks`, важность `HIGH`, создаётся в `requestPermissions`
  - Вызывается из `components/Todo/Todo.tsx` (импорт `rescheduleNextNotification` и `useNotifications`)
- `expo-device` `~8.0.10` - проверка реального устройства (`Device.isDevice`)
- Push-уведомления с сервера (Expo Push Service, FCM, APNs) не используются. Токены не запрашиваются, `getExpoPushTokenAsync` в коде отсутствует.

## CI/CD и развёртывание

**Хостинг:**
- Приложение распространяется как мобильный билд, веб-хостинга нет.

**Сборка:**
- Expo Application Services (EAS Build) - `eas.json`
  - Профиль `development`: dev-клиент, внутреннее распространение
  - Профиль `preview`: APK, внутреннее распространение
  - Профиль `production`: `autoIncrement: true`, AAB
  - `submit.production` - пустой блок, отправка в магазин не настроена параметрами
- EAS project ID: `5fe0e67f-f2a6-49a8-85e5-e4b32bf60688` (`app.json` -> `extra.eas.projectId`)

**CI-пайплайн:**
- Не обнаружен. Файлов `.github/workflows`, `.gitlab-ci.yml` и аналогов в корне нет.

## Переменные окружения

**Обязательные переменные:**
- Не обнаружены. Исходный код не читает `process.env` (поиск по `App.tsx`, `components/`, `hooks/`, `utils/`, `storage/`).

**Секреты:**
- В проекте не хранятся. Файлов `.env*` и ключей не найдено.
- Идентификаторы (EAS project ID, Yandex Ad Unit ID) публичны по своей природе и находятся прямо в конфигурации.

## Webhooks и callbacks

**Входящие:**
- Не используются. Приложение не поднимает серверов и не принимает HTTP-запросы.

**Исходящие:**
- Не используются. Отправки данных на внешние сервисы в коде не обнаружено, кроме загрузки рекламы Yandex SDK.

## Разрешения, влияющие на интеграции

- `NOTIFICATIONS` и `SCHEDULE_EXACT_ALARM` (Android, `app.json`) - нужны для уведомлений
- Разрешения iOS (запрос уведомлений) выполняются через `Notifications.requestPermissionsAsync()` в `hooks/useNotifications.ts`

---

*Integration audit: 2026-10-24*
