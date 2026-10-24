---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
<!-- refreshed: 2026-10-24 -->

# Архитектура

**Analysis Date:** 2026-10-24

## Обзор системы

```text
┌─────────────────────────────────────────────────────────────┐
│              App.tsx  (корневой экран, состояние UI)          │
│   selectedDate · showAll · showAddModal · editData · ads     │
├──────────────┬──────────────────┬───────────────┬────────────┤
│   Header     │   WeekStrip      │ FlatList +    │  AddTodo   │
│ components/  │  components/     │ Todo, Empty-  │ (modal)    │
│ Header/      │  WeekStrip/      │ State         │ AddTodo/   │
└──────┬───────┴────────┬─────────┴───────┬───────┴─────┬──────┘
       │                │                 │             │
       ▼                ▼                 ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│  Hooks: `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`,      │
│         `hooks/useNotifications.ts`                          │
└──────┬──────────────────────┬──────────────────────┬────────┘
       ▼                      ▼                      ▼
┌──────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│ storage/         │  │ utils/              │  │ expo-notifications│
│ todoStorage.ts   │  │ todoFilters, time,  │  │ (системные        │
│ (AsyncStorage)   │  │ recurrence          │  │  уведомления)     │
└──────────────────┘  └─────────────────────┘  └──────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  types/todo.ts · constants/todo.ts · themes/colors.ts ·      │
│  styles.ts  (разделяемые типы, константы и стили)            │
└─────────────────────────────────────────────────────────────┘
```

## Шаблон архитектуры

**Общий:** Клиентское одностраничное мобильное приложение (Expo / React Native 0.81, React 19, новая архитектура включена через `newArchEnabled: true` в `app.json`). Бэкенда нет: все данные хранятся на устройстве.

**Ключевые характеристики:**
- Один экран: все состояние приложения поднято в корневой компонент `App` (`App.tsx`). Навигационной библиотеки (React Navigation и т.п.) нет.
- Слоистость по папкам: UI-компоненты → кастомные хуки → слой хранения/утилит. Прямые обращения к хранилищу встречаются и в UI (см. «Антипаттерны»).
- Состояние списка задач — локальный `useState` внутри хука `useTodos`; источник истины — `AsyncStorage` под ключом `TODOS`.
- Бизнес-логика дат (просрочка, сегодня, повторение) вынесена в чистые функции `utils/todoFilters.ts` и `utils/recurrence.ts`, что позволяет тестировать их без React.
- Стилизация через `StyleSheet.create` в файлах `styles.ts` рядом с компонентами, плюс общие токены в `themes/colors.ts`.
- Типизация: TypeScript в режиме `strict` (`tsconfig.json`, наследует `expo/tsconfig.base`).

## Слои

**Точка входа / корень приложения:**
- Назначение: регистрация корневого компонента Expo и композиция экрана.
- Расположение: `index.ts`, `App.tsx`.
- Содержит: `registerRootComponent(App)`, состояние UI-экрана, инициализацию рекламного SDK, расчёт размера баннера.
- Зависит от: всех хуков, компонентов `Header`, `WeekStrip`, `EmptyState`, `AddTodo`, `Todo`; `yandex-mobile-ads`.
- Используется: Expo runtime (через `index.ts`, `package.json` → `"main": "index.ts"`).

**UI-компоненты (презентационные + локальная логика):**
- Назначение: отрисовка и обработка действий пользователя.
- Расположение: `components/<Name>/<Name>.tsx` и `components/<Name>/styles.ts`.
- Содержит:
  - `components/Header/Header.tsx` — заголовок с датой, кнопки «назад/вперёд», фильтр «все», добавление.
  - `components/WeekStrip/WeekStrip.tsx` — полоса дней недели с выбором даты.
  - `components/Todo/Todo.tsx` — карточка задачи; здесь же обработка выполнения, удаления и повторения.
  - `components/AddTodo/AddTodo.tsx` — модальная форма создания и редактирования задачи (425 строк, самый большой компонент).
  - `components/EmptyState/EmptyState.tsx` — заглушка пустого списка.
- Зависит от: `hooks/useNotifications.ts`, `storage/todoStorage.ts`, `utils/*`, `constants/todo.ts`, `themes/colors.ts`, `types/todo.ts`.
- Используется: `App.tsx`.

**Хуки (состояние и сайд-эффекты):**
- Назначение: инкапсуляция загрузки/изменения данных и уведомлений.
- Расположение: `hooks/`.
- Содержит:
  - `hooks/useTodos.ts` — загрузка всех задач при старте, `onAddTodo`, `onUpdateTodo`, `getAllTodos`; планирование и отмена уведомлений при сохранении.
  - `hooks/useTodoFilters.ts` — мемоизированная выборка отображаемых задач через `filterDisplayedTodos`.
  - `hooks/useNotifications.ts` — запрос разрешений, канал Android `tasks`, функции `scheduleNotification`, `cancelNotification`, `rescheduleNextNotification`, `setNotificationHandler`.
- Зависит от: `storage/`, `utils/`, `expo-notifications`, `expo-device`.
- Используется: `App.tsx`, `components/Todo/Todo.tsx`, `components/AddTodo/AddTodo.tsx` (через пропсы/вызовы).

**Слой хранения (storage):**
- Назначение: единственная точка доступа к `AsyncStorage`.
- Расположение: `storage/todoStorage.ts`.
- Содержит: `loadTodos`, `saveTodos`, `addTodo`, `removeTodo`, `updateTodo`. Ключ — константа `TODOS`. Данные — JSON-массив `TodoItem[]`, новые задачи добавляются в начало.
- Зависит от: `@react-native-async-storage/async-storage`, `types/todo.ts`.
- Используется: `hooks/useTodos.ts`, `components/Todo/Todo.tsx`.

**Утилиты (чистая логика):**
- Назначение: вычисления над датами и временем без побочных эффектов.
- Расположение: `utils/`.
- Содержит:
  - `utils/todoFilters.ts` — `isExpired`, `isToday`, `isFuture`, `sortByDate`, `filterDisplayedTodos`.
  - `utils/recurrence.ts` — `nextRecurrenceDate` (единственное место сдвига на `repeatFrequency`), `nextReminderIso`.
  - `utils/time.ts` — `parseTime`, `formatTime` для строк `HH:mm`.
- Зависит от: `date-fns`, `types/todo.ts`.
- Используется: хуки, компоненты.

**Типы, константы, темы:**
- `types/todo.ts` — тип `TodoItem`, `Size` (значения Фибоначчи 1, 3, 5, 8, 13), `SizeItem`, `SizeOption`.
- `constants/todo.ts` — словарь `sizes` (цвет и подписи по размеру), `sizeOptions`, валидаторы `isValidSize`, `isValidRepeatFrequency`.
- `themes/colors.ts` — палитра `colors`, тени `shadows`, отступы `spacing`, радиусы `radius`.
- `styles.ts` (корень) — общие стили экрана `App`.

## Поток данных

### Основной путь: отображение списка на выбранную дату

1. Старт приложения: `useTodos` вызывает `loadTodos()` в `useEffect` и сохраняет результат в `allTodos` (`hooks/useTodos.ts`).
2. `App` передаёт `allTodos` и `selectedDate` в `useTodoFilters`, который вызывает `filterDisplayedTodos` (`hooks/useTodoFilters.ts` → `utils/todoFilters.ts`).
3. Результат — `displayedTodos` — рендерится через `FlatList` в `App.tsx`; каждый элемент — `components/Todo/Todo.tsx` с флагами `isExpired` / `isFuture`.
4. `WeekStrip` получает `allTodos` для индикации задач по дням и `onSelectDate` для смены `selectedDate`.

### Создание или редактирование задачи

1. Кнопка в `components/Header/Header.tsx` вызывает `setShowAddModal(true)` в `App.tsx`; для редактирования — `openEditModal(item)` с заполнением `editData`.
2. `components/AddTodo/AddTodo.tsx` валидирует поля (`isValidSize`, `isValidRepeatFrequency`) и вызывает `onAddTodo(newTodo)` или `onUpdateTodo(id, updated)` из `useTodos`.
3. `useTodos.onAddTodo` при наличии `reminderDate` вызывает `scheduleNotification` (`hooks/useNotifications.ts`), записывает `notificationId` и `reminderDate` (ISO), затем `addTodo` (`storage/todoStorage.ts`) и добавляет задачу в начало `allTodos`.
4. `useTodos.onUpdateTodo` отменяет старое уведомление, планирует новое, вызывает `updateTodo` и перечитывает список через `getAllTodos()`.

### Выполнение задачи (повторяемой или разовой)

1. Пользователь выбирает действие в `components/Todo/Todo.tsx` (`onTaskComplete`, `showAlertForExpiredTask`).
2. Для разовой задачи — `removeTodo(todo.id)`. Для повторяемой — `nextRecurrenceDate(base, repeatFrequency)` вычисляет новую `nextDate`, `nextReminderIso` переносит время напоминания.
3. `handleCompleteTask` вызывает `rescheduleNextNotification` (`hooks/useNotifications.ts`), который отменяет старое уведомление и планирует новое без повторного сдвига даты, затем `updateTodo` и `getAllTodos()` для обновления состояния `App`.

**Управление состоянием:**
- Локально в компонентах: `useState` в `App.tsx` (дата, фильтр, модалка, баннер) и в `AddTodo.tsx` (поля формы).
- Глобального стора (Redux, Zustand, Context) нет. Список задач передаётся сверху вниз через пропсы и колбэк `getAllTodos`.

## Ключевые абстракции

**`TodoItem`:**
- Назначение: единая модель задачи, одновременно доменная и форма хранения.
- Пример: `types/todo.ts`.
- Паттерн: плоский объект с ISO-строками дат. `nextDate` хранит `yyyy-MM-dd`, `reminderDate` — ISO-строку с временем, `lastUpdated` — дата последнего выполнения.

**Фильтрация по дате:**
- Назначение: определить, какие задачи показывать (просроченные всегда сверху, затем на выбранную дату или все).
- Пример: `utils/todoFilters.ts` (`filterDisplayedTodos`).
- Паттерн: чистая функция с параметром `now`, что упрощает тестирование.

**Повторение задач:**
- Назначение: вычислить следующую дату выполнения.
- Пример: `utils/recurrence.ts`.
- Паттерн: единственная точка сдвига даты. Документация в комментарии прямо запрещает прибавлять `repeatFrequency` повторно в вызывающем коде.

**Уведомления:**
- Назначение: обёртка над `expo-notifications` с учётом Android (`exact: true`, канал `tasks`).
- Пример: `hooks/useNotifications.ts`.
- Паттерн: функции-хелперы экспортируются наравне с хуком `useNotifications`.

## Точки входа

**Регистрация приложения:**
- Расположение: `index.ts`.
- Триггер: запуск Expo runtime (`package.json` → `"main"`).
- Ответственность: `registerRootComponent(App)`.

**Корневой экран:**
- Расположение: `App.tsx` (экспорт по умолчанию `App`).
- Триггер: монтирование корневого компонента.
- Ответственность: состояние экрана, инициализация `MobileAds`, рендер списка и баннера.

**Скрипты запуска:**
- Расположение: `package.json` → `scripts` (`start`, `android`, `ios`, `web` через `expo start`).

**Сборка:**
- Расположение: `eas.json` (профили `development`, `preview` в APK, `production` с `autoIncrement`), `app.json` (конфигурация Expo, плагины `expo-notifications` и `@react-native-community/datetimepicker`).

## Архитектурные ограничения

- **Потоки:** однопоточная модель JavaScript (Hermes через React Native); асинхронность через `async/await` с `AsyncStorage` и `expo-notifications`. Собственных воркеров нет.
- **Глобальное состояние:** модульный уровень только в `hooks/useNotifications.ts` (вызов `Notifications.setNotificationHandler` при импорте) и в `themes/colors.ts` и `constants/todo.ts` (константы). Общего мутабельного стора нет.
- **Циклические импорты:** в просмотренных файлах не обнаружены. `Todo.tsx` и `useTodos.ts` зависят от `useNotifications.ts`, который зависит только от `utils/time.ts` и `types/todo.ts`.
- **Дублирование импорта:** `components/Todo/Todo.tsx` импортирует `useNotifications` и `rescheduleNextNotification` из одного модуля двумя строками (`hooks/useNotifications.ts`, строки 19–20).
- **Единственный экран:** навигации нет; добавление новых экранов потребует подключения навигатора.

## Антипаттерны

### Прямая запись в хранилище из UI-компонента

**Что происходит:** `components/Todo/Todo.tsx` вызывает `removeTodo` и `updateTodo` из `storage/todoStorage.ts` напрямую, а затем вручную вызывает `getAllTodos()`, переданный пропсом.
**Почему это плохо:** логика изменения данных дублируется вне `hooks/useTodos.ts`. Состояние `allTodos` может разойтись с хранилищем, если один из путей забудет обновить список. Кроме того, отмена уведомления при удалении (`cancelNotification`) дублирует логику `onUpdateTodo`.
**Как делать правильно:** добавлять операции `onDeleteTodo` и `onCompleteTodo` в `hooks/useTodos.ts` и передавать их в `Todo` через пропсы, по образцу `onAddTodo` / `onUpdateTodo`.

### Множественные экземпляры `useNotifications`

**Что происходит:** хук `useNotifications` вызывается и в `hooks/useTodos.ts`, и в `components/Todo/Todo.tsx` (для каждой карточки). Каждый вызов в `useEffect` запрашивает разрешения, регистрирует слушатели и создаёт канал Android.
**Почему это плохо:** при списке из N задач выполняется N запросов разрешений и N пар подписок на события уведомлений, что лишнее и может вызывать повторные `alert` при отказе.
**Как делать правильно:** вызывать `useNotifications` один раз на уровне `App` или `useTodos` и передавать функции вниз, либо вынести функции `scheduleNotification` / `cancelNotification` в чистые экспорты без хука (они уже экспортируются отдельно).

### Вызов `alert` внутри хука

**Что происходит:** `hooks/useNotifications.ts` вызывает глобальный `alert("Разрешите уведомления в настройках")` в `requestPermissions`.
**Почему это плохо:** побочный UI-эффект внутри хука, который вызывается при каждом монтировании.
**Как делать правильно:** возвращать статус разрешения (`permissionGranted` уже есть) и показывать сообщение из компонента.

## Обработка ошибок

**Стратегия:** локальный `try/catch` с показом `Alert.alert` в хуках и компонентах; ошибки хранилища пробрасываются наверх.

**Паттерны:**
- `hooks/useTodos.ts` ловит ошибку загрузки и показывает `Alert.alert("Ошибка", ...)`, при ошибке планирования уведомления задача всё равно сохраняется без `notificationId`.
- `storage/todoStorage.ts` перебрасывает исключения (`throw error`) без обработки.
- `App.tsx` для рекламного SDK и размера баннера логирует ошибки через `console.log` и не прерывает работу.

## Сквозные задачи

**Логирование:** `console.log` / `console.warn` (в `App.tsx`, `hooks/useNotifications.ts`); отдельного логгера нет.
**Валидация:** в `components/AddTodo/AddTodo.tsx` через состояние `error` и хелперы `isValidSize`, `isValidRepeatFrequency` из `constants/todo.ts`.
**Аутентификация:** не применяется; пользователей и сессий нет.

---

*Architecture analysis: 2026-10-24*
