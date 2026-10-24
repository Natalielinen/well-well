---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
<!-- refreshed: 2026-10-24 -->

# Тестирование

**Дата анализа:** 2026-10-24

## Статус

**Автоматические тесты в проекте отсутствуют.** Тестовых файлов (`*.test.*`, `*.spec.*`, папок `__tests__`) нет, тестовый раннер не установлен, скрипта `test` в `package.json` нет.

## Test Framework

**Раннер:**
- Не настроен. Нет `jest.config.*`, `vitest.config.*`, секции `jest` в `package.json`
- Зависимости для тестирования (`jest`, `jest-expo`, `@testing-library/react-native`, `vitest`) в `package.json` не указаны

**Библиотека утверждений:**
- Не выбрана

**Команды запуска:**

```bash

# Тестов нет; доступны только проверки типов и запуск приложения

npx tsc --noEmit        # Проверка типов (strict, см. tsconfig.json)
npm run start           # Запуск Expo-сервера (package.json: "start": "expo start")
```

## Test File Organization

**Расположение:** тесты не созданы. Рекомендуемый вариант для этого проекта - co-located рядом с модулем:
- `utils/recurrence.test.ts` рядом с `utils/recurrence.ts`
- `utils/todoFilters.test.ts` рядом с `utils/todoFilters.ts`
- `components/Todo/Todo.test.tsx` рядом с `components/Todo/Todo.tsx`

**Именование:** `<имя модуля>.test.ts(x)`

## Что тестировать в первую очередь

Чистые функции без зависимостей от нативных модулей, которые легко покрыть unit-тестами:

**`utils/recurrence.ts`:**
- `nextRecurrenceDate(base, repeatFrequency)` - сдвиг даты на `repeatFrequency` дней, формат `yyyy-MM-dd`
- `nextReminderIso(nextDate, currentReminderDate)` - перенос времени суток из напоминания на новую дату, возврат `undefined` без напоминания

**`utils/todoFilters.ts`:**
- `isExpired`, `isFuture`, `isToday` - сравнение дат через `startOfDay`
- `filterDisplayedTodos(todos, selectedDate, showAll, now)` - порядок: сначала просроченные, затем задачи на выбранный день (или все задачи при `showAll`)
- `sortByDate` - сортировка по строке `nextDate`

**`utils/time.ts`:**
- `parseTime("HH:mm")` - валидные и невалидные строки (`"25:00"`, `"1:5"`) должны возвращать `null`
- `formatTime(date)` - ведущие нули

**`constants/todo.ts`:**
- `isValidSize`, `isValidRepeatFrequency` - граничные значения (0, -1, 1.5, допустимые размеры 1/3/5/8/13)

**Хранилище `storage/todoStorage.ts`:**
- Тестировать с моком `@react-native-async-storage/async-storage` (имеет официальный мок в документации библиотеки): `addTodo` кладёт задачу в начало, `updateTodo` заменяет по `id`, `removeTodo` удаляет

**Хуки `hooks/useTodos.ts`, `hooks/useNotifications.ts`:**
- Требуют моков `expo-notifications`, `expo-device`, `react-native` (`Alert`, `Platform`)
- Для тестирования хуков подходит `@testing-library/react-native` с `renderHook`

## Mocking

**Фреймворк:** не выбран

**Шаблон мока (рекомендуемый, для Jest + jest-expo):**

```typescript
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => "notification-id"),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: { DATE: "date" },
  AndroidImportance: { HIGH: 4 },
  setNotificationChannelAsync: jest.fn(),
}));
```

**Что мокать:**
- Нативные модули Expo и React Native: `expo-notifications`, `expo-device`, `@react-native-async-storage/async-storage`, `yandex-mobile-ads`
- `Alert` из `react-native` - для проверки текстов ошибок в `hooks/useTodos.ts` и `components/Todo/Todo.tsx`
- Системное время для тестов `isExpired`, `filterDisplayedTodos` (параметр `now` уже есть в сигнатурах - передавать явно, а не мокать `Date`)

**Что не мокать:**
- Чистые функции в `utils/` и `constants/` - тестировать напрямую
- `date-fns` - использовать реальную реализацию

**Текущее место, где моки неизбежны:** `hooks/useNotifications.ts` вызывает `Notifications.setNotificationHandler` на уровне модуля (при импорте), поэтому тесты, импортирующие этот файл, должны мокать `expo-notifications` до импорта.

## Fixtures and Factories

**Тестовые данные:** фабрик и фикстур в проекте нет. Рекомендуемый шаблон для `TodoItem` (тип из `types/todo.ts`):

```typescript
import { TodoItem } from "../types/todo";

export const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 1,
  title: "Тестовая задача",
  description: "",
  lastUpdated: "",
  isRepeat: false,
  repeatFrequency: 0,
  nextDate: "2026-10-24",
  size: 1,
  ...overrides,
});
```

**Расположение:** при появлении тестов - папка `__fixtures__/` или `tests/fixtures/` в корне

## Coverage

**Требования:** не заданы

**Просмотр покрытия:** команда не настроена. После установки Jest: `npx jest --coverage`

## Test Types

**Unit-тесты:** отсутствуют. Наибольшая ценность - в `utils/` и `constants/` (см. раздел «Что тестировать в первую очередь»)

**Интеграционные тесты:** отсутствуют. Кандидаты - связка `hooks/useTodos.ts` + `storage/todoStorage.ts` (загрузка, добавление, обновление с моком AsyncStorage)

**E2E-тесты:** не используются. Для проверки уведомлений и рекламного SDK требуется реальное устройство (`Device.isDevice` в `hooks/useNotifications.ts`), поэтому ручная проверка на устройстве остаётся основным способом

## Текущий способ проверки

- Проверка типов: `npx tsc --noEmit` (строгий режим)
- Ручная проверка на устройстве или эмуляторе через `npm run start` / `npm run android`
- Ключевые сценарии для ручной проверки:
  - Создание повторяющейся задачи и её выполнение (`components/Todo/Todo.tsx`, `onTaskComplete`)
  - Просроченная задача и выбор даты при выполнении (`showAlertForExpiredTask`)
  - Напоминание: установка, перенос на следующую дату при выполнении, отмена при удалении (`hooks/useNotifications.ts`, `hooks/useTodos.ts`)
  - Фильтр «Все задачи» и навигация по датам (`App.tsx`, `components/WeekStrip/WeekStrip.tsx`)

## Common Patterns

**Асинхронное тестирование (рекомендуемый вид):**

```typescript
it("сохраняет задачу в начало списка", async () => {
  await addTodo(makeTodo({ id: 2 }));
  const todos = await loadTodos();
  expect(todos[0].id).toBe(2);
});
```

**Тестирование ошибок (рекомендуемый вид):**

```typescript
it("возвращает null для некорректного времени", () => {
  expect(parseTime("25:00")).toBeNull();
  expect(parseTime("1:5")).toBeNull();
});
```

**Тестирование фильтров с фиксированным временем:**

```typescript
const now = new Date("2026-10-24T10:00:00");
expect(isExpired(makeTodo({ nextDate: "2026-10-23" }), now)).toBe(true);
```

---

*Анализ тестирования: 2026-10-24*
