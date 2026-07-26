# Phase 4: Testing — Research

**Researched:** 2026-07-26
**Domain:** Настройка тест-инфраструктуры (jest-expo/RNTL) и unit/integration-тесты для Expo SDK 54 / React Native 0.81 / React 19 проекта
**Confidence:** HIGH (стек и конфигурация подтверждены npm registry + официальные источники), MEDIUM по деталям экосистемных нюансов (версии jest vs jest-expo)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Используется **`jest-expo`** (официальный preset Expo под SDK ~54) + **`@testing-library/react-native`** (RNTL) для тестов, требующих рендера компонентов. НЕ голый jest и НЕ vitest — jest-expo из коробки даёт корректные transform для `react-native`/`expo` и native-моки, что критично для RN 0.81/React 19. — **Reversibility:** costly — смена раннера позже затрагивает конфиг и все тест-файлы.
- **D-02:** Тест-раннер и зависимости ставятся как `devDependencies`; добавляются npm-скрипты `test` и `test:watch` в `package.json`. Конфигурация jest — через preset `jest-expo` (`jest.config` или ключ `jest` в package.json на усмотрение агента).
- **D-03:** TypeScript-трансформация тестов — через babel-preset, поставляемый jest-expo (не ts-jest), чтобы согласоваться с транспиляцией Expo.
- **D-04 (TEST-01):** Unit-тесты для чистых утилит: `utils/todoFilters.ts` (`isExpired`/`isToday`/`isFuture`/`sortByDate`/`filterDisplayedTodos`) и `utils/time.ts` (`parseTime`/`formatTime`). Чистые функции без React — тестируются напрямую, без рендера/моков. Покрыть edge-cases (граница дат, невалидный ввод времени → `null`, порядок сортировки).
- **D-05 (TEST-02):** «Логика завершения задачи» тестируется в первую очередь на **чистой утилите `utils/recurrence.ts`** (`nextRecurrenceDate`/`nextReminderIso`). Обязательный кейс — защита от регрессии бага двойного сдвига `repeatFrequency` (сдвиг ровно на одну частоту; см. `.planning/debug/recurring-notification-stops-after-complete.md`). Тестирование ветвления `onTaskComplete` внутри `Todo.tsx` через RNTL — НЕ в области этой фазы.
- **D-06 (TEST-03):** Unit-тесты `hooks/useNotifications.ts` (`scheduleNotification`, `cancelNotification`, `rescheduleNextNotification`, `getEffectiveReminderDate`) с моком `expo-notifications` через `jest.mock("expo-notifications")` — фейковые `scheduleNotificationAsync`/`cancelScheduledNotificationAsync`, проверка `getEffectiveReminderDate` (прошлое → now+60с) и отсутствия двойного сдвига в `rescheduleNextNotification`.
- **D-07 (TEST-04):** Интеграционные тесты `storage/todoStorage.ts` (`saveTodos`/`loadTodos`/`addTodo`/`removeTodo`/`updateTodo`) с **официальным in-memory jest-моком** `@react-native-async-storage/async-storage` (`.../jest/async-storage-mock`). Edge-cases: пустой storage, битый JSON (проброс ошибки — контракт BUGF-02), round-trip сериализации.
- **D-08:** Нативные модули мокаются **официальными / in-memory** средствами, а не кастомными: AsyncStorage — официальный jest-мок; `expo-notifications` — `jest.mock` с фейковыми функциями. Кастомные `__mocks__` — только если официального мока нет.

### Claude's Discretion

- Точная структура тест-файлов (`*.test.ts` рядом с модулем vs `__tests__/`) и организация — на усмотрение планировщика/исполнителя.
- Расположение jest-конфига (отдельный файл vs `package.json`), setup-файлы (jest.setup) — на усмотрение агента.
- Конкретный набор edge-case ассертов на модуль — за агентом, при покрытии перечисленных в D-04…D-07 контрактов.

### Deferred Ideas (OUT OF SCOPE)

- Тесты компонентов через RNTL (ветвление `onTaskComplete` в `Todo.tsx`, рендер карточек/модалки, Alert-флоу) — вне TEST-02 этой фазы.
- Пороги покрытия (coverage thresholds) и CI (GitHub Actions) — вне v1-цели.
- E2E-тесты (Detox/Appium) — вне области проекта на текущем этапе.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| TEST-01 | Unit-тесты утилит дат и фильтрации (`utils/todoFilters.ts`, `utils/time.ts`) | § Standard Stack (jest-expo setup), § Code Examples → «Чистые утилиты», § Common Pitfalls (детерминированность времени не нужна — `now`/`selectedDate` уже инъецируются) |
| TEST-02 | Unit-тесты логики завершения задачи (`utils/recurrence.ts`) + регрессия двойного сдвига | § Code Examples → «recurrence.ts», § Common Pitfalls → регрессионный контракт, § Validation Architecture |
| TEST-03 | Unit-тесты `hooks/useNotifications.ts` с моками Expo Notifications | § Architecture Patterns → «useNotifications — не хук, а module-level функции», § Code Examples → мок `expo-notifications`/`expo-device`/`Platform.OS` |
| TEST-04 | Интеграционные тесты `storage/todoStorage.ts` | § Code Examples → «AsyncStorage jest mock», § Package Legitimacy Audit |

</phase_requirements>

## Summary

Проект (Expo ~54.0.34, React Native 0.81.5, React 19.1.0, TypeScript ~5.9.2) сейчас не имеет тестовой инфраструктуры вообще. Официальный и единственно поддерживаемый Expo путь для SDK 54 — preset `jest-expo` поверх `jest`, плюс `@testing-library/react-native` (RNTL) для рендер-тестов [CITED: docs.expo.dev/develop/unit-testing]. Ключевой нюанс версии: `jest-expo` в ветке `54.x` (последний патч на момент исследования — `54.0.17` [VERIFIED: npm registry]) внутри зависит от `babel-jest`/`jest-environment-jsdom`/`jest-snapshot`/`@jest/globals` версии `^29.2.1` — то есть верхнеуровневый `jest` должен ставиться из семейства **29.x** (последняя `29.7.0` [VERIFIED: npm registry]), а НЕ последний `jest@30.4.2`, иначе возникает предупреждение «Multiple versions of Jest were found» [CITED: github.com/expo/expo issues + npm view]. Официальный установочный путь `npx expo install jest-expo jest @types/jest --dev` сам разрешает совместимые версии и должен использоваться вместо `npm install <pkg>@latest`.

Для React 19 старый `react-test-renderer` официально deprecated и не поддерживает React 19+ [CITED: docs.expo.dev, npmjs.com/package/react-test-renderer]; его заменяет `@testing-library/react-native@14.0.1` [VERIFIED: npm registry, published 2026-06-23], которая сама теперь опирается на новый пакет-пир `test-renderer@^1.0.0` (лёгкая замена от того же community — mdjastrzebski/test-renderer) [VERIFIED: npm registry]. Важно: RNTL v14 API асинхронный — `render`/`renderHook`/`fireEvent`/`act` возвращают `Promise` и требуют `await` [CITED: github.com/callstack/react-native-testing-library releases].

Практически важная находка для TEST-03: `hooks/useNotifications.ts` экспортирует `getEffectiveReminderDate`, `scheduleNotification`, `cancelNotification`, `rescheduleNextNotification` как **module-level функции вне тела хука** — их можно импортировать и вызывать напрямую в тестах, **без `renderHook` и без RNTL вообще**. RNTL нужна только если бы тестировался сам хук `useNotifications()` (что вне области TEST-03 согласно D-06). Это радикально упрощает конфигурацию тестов TEST-03 — обычный `jest.mock("expo-notifications")` + прямой `import`.

Для TEST-04 официальный in-memory мок `@react-native-async-storage/async-storage/jest/async-storage-mock` подтверждён присутствующим в тарболе версии `2.2.0` (ровно та, что в `package.json` проекта) [VERIFIED: npm registry tarball inspection] — исходный код мока хранит данные в `__INTERNAL_MOCK_STORAGE__`, `getItem` возвращает `null` при отсутствии ключа (не `undefined`), `clear()` сбрасывает store между тестами.

**Primary recommendation:** Установить `jest-expo@^54.0.17` + `jest@^29.7.0` + `@types/jest@^29.5.14` + `@testing-library/react-native@^14.0.1` (devDependencies), конфиг через `"jest": { "preset": "jest-expo" }` в `package.json` (не отдельный `jest.config.js` — меньше файлов, преимущество не критично, выбор оставлен агенту согласно Discretion), тест-файлы `*.test.ts` рядом с модулем. `utils/todoFilters.ts`, `utils/time.ts`, `utils/recurrence.ts` — прямые pure-function тесты без моков и без fake timers (даты уже инъецируются параметрами). `useNotifications.ts` — прямой импорт стандалон-функций + `jest.mock("expo-notifications")`. `todoStorage.ts` — официальный AsyncStorage jest-mock через `jest.mock(...)` в setup-файле.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Фильтрация/сортировка задач по дате (TEST-01) | Client (JS pure logic) | — | Чистые функции `utils/todoFilters.ts`/`utils/time.ts` не имеют side-эффектов и не зависят от платформы — тестируются в изоляции |
| Вычисление следующей даты повторения (TEST-02) | Client (JS pure logic) | — | `utils/recurrence.ts` — чистая функция дат, вынесена из UI-слоя в Phase 3 именно для тестируемости |
| Планирование/отмена уведомлений (TEST-03) | Client (JS logic layer в `hooks/useNotifications.ts`) | Native Bridge (`expo-notifications`, ОС-планировщик) | Модуль вызывает нативный мост Expo; в тестах нативный мост подменяется `jest.mock`, поэтому тестируется только JS-логика (formatting, effective-date вычисление, single-shift контракт), а не фактическая доставка |
| CRUD персистентности задач (TEST-04) | Local Storage (AsyncStorage) | Client (JS wrapper в `storage/todoStorage.ts`) | `todoStorage.ts` — тонкая обёртка над AsyncStorage; интеграционный тест проверяет контракт JS-обёртка ↔ storage API, с official in-memory mock вместо реального диска |
| Тест-раннер/инфраструктура (D-01…D-03) | Build/Tooling (devDependency, не входит в рантайм-бандл) | — | `jest-expo`/`jest`/RNTL работают только в Node-окружении при запуске тестов; не влияют на production-бандл приложения |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| `jest-expo` | `^54.0.17` [VERIFIED: npm registry — latest 54.x patch, package created 2017, official expo/expo monorepo] | Jest preset: babel-transform для RN/Expo, автомоки native-модулей, transformIgnorePatterns, testEnvironment | Единственный официально поддерживаемый Expo preset для SDK 54; голый `jest` не умеет транспилировать RN/Expo ESM-модули из коробки |
| `jest` | `^29.7.0` [VERIFIED: npm registry] | Test runner/assertion API | Требуется как top-level peer; версия 29.x выбрана намеренно НЕ как последняя (30.4.2), чтобы совпасть с внутренними зависимостями `jest-expo@54.x` (`babel-jest`/`jest-environment-jsdom`/`jest-snapshot`/`@jest/globals` пином `^29.2.1`) и избежать предупреждения «Multiple versions of Jest were found» |
| `@testing-library/react-native` | `^14.0.1` [VERIFIED: npm registry, published 2026-06-23] | Рендер-тестирование React-компонентов (задел на будущее; в этой фазе используется минимально — не для TEST-01..04 напрямую, D-01 требует наличия в стеке) | Официальная замена deprecated `react-test-renderer`; единственная поддерживающая React 19 |
| `@types/jest` | `^29.5.14` [VERIFIED: npm registry — последняя версия ветки 29.x, совпадает с jest 29] | TypeScript-типы для `describe`/`it`/`expect` | Должна совпадать по мажорной версии с установленным `jest` (не latest `@types/jest@30.0.0`, который таргетит `jest@30`) |
| `test-renderer` | `^1.0.0` [VERIFIED: npm registry, репозиторий `github.com/mdjastrzebski/test-renderer`, peer `react: ^19.0.0`] | Пир-зависимость RNTL v14, лёгкая замена deprecated `react-test-renderer` | Устанавливается автоматически как транзитивная зависимость RNTL v14 (`peerDependencies: { "test-renderer": "^1.0.0" }`); явно ставить в devDependencies не обязательно, но рекомендуется зафиксировать явно во избежание peer-dependency предупреждений npm |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| — | — | — | Дополнительных supporting-библиотек для TEST-01..04 не требуется — `date-fns@^4.1.0` уже есть в `dependencies` и не нуждается в отдельной тестовой обвязке (см. Common Pitfalls) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `jest-expo` | голый `jest` + ручной babel-config | Локально быстрее настроить, но теряются готовые automocks native-модулей Expo (`ExpoDevice`, `ExpoNotificationScheduler` и т.д.) и правильный `transformIgnorePatterns` — пришлось бы копировать вручную и поддерживать при апгрейдах Expo. Отклонено решением D-01. |
| `@testing-library/react-native` | `react-test-renderer` напрямую | `react-test-renderer` deprecated и не поддерживает React 19 — привёл бы к console warning/потенциальным поломкам. Отклонено. |
| Официальный AsyncStorage jest-mock | `mock-async-storage` (community npm-пакет) | Community-пакет не обновлялся под RN 0.81/новые API; официальный мок поставляется прямо в тарболе установленной версии `2.2.0` — нет доп. зависимости. Отклонено решением D-08. |

**Installation:**
```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```
(На Windows, если `npx expo install` требует явного разделителя перед доп. флагами: `npx expo install jest-expo jest @types/jest "--" --dev` [CITED: docs.expo.dev/develop/unit-testing].)

**Version verification:** версии выше подтверждены через `npm view <pkg> version` / `npm view <pkg> versions --json` против npm registry непосредственно в ходе этого исследования (дата: 2026-07-26). `jest-expo@54.x` — актуальная ветка под установленный `expo@~54.0.34`; более новая мажорная ветка `jest-expo@57.x` существует в registry, но НЕ должна использоваться — она таргетит будущий Expo SDK, не 54.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|--------------|---------|-------------|
| `jest-expo` | npm | создан 2017-03-03 (~9 лет) | 2.4M/нед | `github.com/expo/expo` (монорепо) | **SUS** (heuristic: «too-new» — сработал на дате публикации *последнего патча*, а не возрасте пакета) | **Approved** — ложное срабатывание эвристики свежести патча на официальном, давно существующем пакете Expo-монорепо; тем не менее по протоколу планировщик должен добавить `checkpoint:human-verify` перед установкой |
| `jest` | npm | много лет, легендарный пакет Meta/OpenJS | 45.5M/нед | `github.com/jestjs/jest` | OK | Approved |
| `@testing-library/react-native` | npm | зрелый пакет callstack | 3.2M/нед | `github.com/callstack/react-native-testing-library` | OK | Approved |
| `@types/jest` | npm | DefinitelyTyped, зрелый | 41.6M/нед | `github.com/DefinitelyTyped/DefinitelyTyped` | OK | Approved |
| `test-renderer` | npm | опубликован 2026-01-07, последняя версия 2026-04-16 | 631K/нед | `github.com/mdjastrzebski/test-renderer` | OK | Approved (несмотря на относительную новизну пакета, скрипт легитимности не пометил его как подозрительный — 631K/нед загрузок и является официальной пир-зависимостью RNTL v14) |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `jest-expo` — см. диспозицию выше (ложное срабатывание). Планировщик должен вставить задачу `checkpoint:human-verify` непосредственно перед шагом установки `jest-expo`, но исследование НЕ рекомендует искать альтернативу — пакет легитимен.

Postinstall-скрипты проверены (`npm view <pkg> scripts.postinstall`) для всех пяти пакетов выше — ни у одного нет `postinstall` [VERIFIED: npm registry].

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────┐
                    │   npm test / npm run test:watch │
                    └───────────────┬─────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │  jest CLI (jest@29.7.0)      │
                    │  preset: "jest-expo"          │
                    └───────────────┬─────────────┘
                                    │ babel transform (jest-expo babel preset)
                                    ▼
        ┌───────────────────────────────────────────────────────┐
        │                     Test files (*.test.ts)              │
        │                                                          │
        │  utils/todoFilters.test.ts ──▶ import { isExpired, ... } │
        │  utils/time.test.ts        ──▶ import { parseTime, ... } │
        │  utils/recurrence.test.ts  ──▶ import { nextRecurrence..}│
        │       (чистые функции — прямой вызов, без моков)         │
        │                                                          │
        │  hooks/useNotifications.test.ts                          │
        │       ──▶ jest.mock("expo-notifications")                │
        │       ──▶ import { scheduleNotification, ... } напрямую  │
        │              (НЕ через renderHook — это module-level fn) │
        │                                                          │
        │  storage/todoStorage.test.ts                             │
        │       ──▶ jest.mock AsyncStorage → official in-memory    │
        │              mock (@.../jest/async-storage-mock)         │
        │       ──▶ import { saveTodos, loadTodos, ... }            │
        └───────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │   Jest reporter → exit code   │
                    │   0 = все тесты прошли         │
                    └─────────────────────────────┘
```

### Recommended Project Structure
```
utils/
├── todoFilters.ts
├── todoFilters.test.ts     # co-located, чистые функции
├── time.ts
├── time.test.ts
├── recurrence.ts
└── recurrence.test.ts      # содержит обязательный regression-тест одиночного сдвига
hooks/
├── useNotifications.ts
└── useNotifications.test.ts  # jest.mock("expo-notifications"), без renderHook
storage/
├── todoStorage.ts
└── todoStorage.test.ts     # jest.mock AsyncStorage через official mock
jest.setup.js                # (опционально) регистрация AsyncStorage mock глобально
package.json                # "jest": { "preset": "jest-expo", "setupFiles": [...] }
```

### Pattern 1: Прямое тестирование чистых функций (TEST-01, TEST-02)
**What:** `utils/todoFilters.ts`, `utils/recurrence.ts` не содержат React/native-зависимостей и принимают все временные параметры явно (`now`, `selectedDate`, `base`) — тестируются обычным `import` + вызовом, без jest.mock, без fake timers, без RNTL.
**When to use:** Любая чистая функция без побочных эффектов и без обращения к глобальному состоянию (`new Date()` без параметра, глобальный singletons и т.д.).
**Example:**
```typescript
// utils/todoFilters.test.ts
// Source: чтение исходного файла utils/todoFilters.ts + STATE.md decision
// "isExpired/isFuture принимают необязательный now (default new Date())
// для будущего unit-тестирования без моков времени"
import { isExpired, isToday, isFuture, sortByDate, filterDisplayedTodos } from "./todoFilters";
import { TodoItem } from "../types/todo";

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 1,
  title: "t",
  description: "",
  lastUpdated: "",
  isRepeat: false,
  repeatFrequency: 0,
  nextDate: "2026-07-26",
  size: 1,
  ...overrides,
});

test("isExpired: nextDate до today -> true", () => {
  const now = new Date("2026-07-27T00:00:00Z");
  expect(isExpired(makeTodo({ nextDate: "2026-07-26" }), now)).toBe(true);
});

test("isExpired: nextDate == today -> false (граница дня)", () => {
  const now = new Date("2026-07-26T15:00:00Z");
  expect(isExpired(makeTodo({ nextDate: "2026-07-26" }), now)).toBe(false);
});
```

### Pattern 2: Регрессионный контракт «единственный сдвиг repeatFrequency» (TEST-02)
**What:** `nextRecurrenceDate(base, repeatFrequency)` — единственное место сдвига даты; тест должен явно зафиксировать, что вызов сдвигает ровно на `repeatFrequency` дней от `base`, а не дважды.
**When to use:** Обязательно, согласно `.planning/debug/recurring-notification-stops-after-complete.md`.
**Example:**
```typescript
// utils/recurrence.test.ts
// Source: .planning/debug/recurring-notification-stops-after-complete.md
//         (контракт: "функция должна планировать уведомление на уже готовую
//          todo.reminderDate ... дату НЕ сдвигаем повторно")
import { nextRecurrenceDate, nextReminderIso } from "./recurrence";

test("nextRecurrenceDate: сдвиг ровно на repeatFrequency, не дважды", () => {
  const base = new Date("2026-07-20");
  const once = nextRecurrenceDate(base, 7);
  expect(once).toBe("2026-07-27");

  // regression guard: повторный вызов от РЕЗУЛЬТАТА (симулирует баг двойного
  // применения) обязан отличаться от одиночного сдвига — документирует, что
  // вызывающий код НЕ должен звать функцию дважды подряд от одной базы.
  const twice = nextRecurrenceDate(new Date(once), 7);
  expect(twice).not.toBe(once);
  expect(twice).toBe("2026-08-03");
});

test("nextReminderIso: undefined без currentReminderDate", () => {
  expect(nextReminderIso("2026-07-27", undefined)).toBeUndefined();
});

test("nextReminderIso: переносит время суток на nextDate", () => {
  const iso = nextReminderIso("2026-07-27", "2026-07-20T09:30:00.000Z");
  const result = new Date(iso!);
  // Сравниваем локальные часы/минуты, т.к. formatTime использует getHours/getMinutes
  const original = new Date("2026-07-20T09:30:00.000Z");
  expect(result.getHours()).toBe(original.getHours());
  expect(result.getMinutes()).toBe(original.getMinutes());
});
```

### Pattern 3: Тестирование module-level функций useNotifications БЕЗ renderHook (TEST-03)
**What:** `scheduleNotification`, `cancelNotification`, `rescheduleNextNotification`, `getEffectiveReminderDate` объявлены как `export const ... = async (...) => {...}` **вне** тела функции `useNotifications()` (строки 19-77 файла) — это обычные async-функции модуля, не хуки. Прямой `import` и вызов работает без `renderHook`/`act`/RNTL.
**When to use:** Всегда, когда тестируемая логика не зависит от React state/lifecycle (`useState`/`useEffect`/`useRef`). В этом файле только сама функция `useNotifications()` (строки 79-146) — настоящий хук; она вне области TEST-03.
**Example:**
```typescript
// hooks/useNotifications.test.ts
// Source: hooks/useNotifications.ts (прочитан целиком в этой сессии) +
// jest-expo tarball inspection (src/preset/moduleMocks/expoModules.js
// НЕ содержит "expo-notifications" на уровне JS-пакета — только native-биндинг
// ExpoNotificationScheduler и т.п. — поэтому явный jest.mock обязателен).
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: "date" },
  scheduleNotificationAsync: jest.fn().mockResolvedValue("mock-notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as Notifications from "expo-notifications";
import {
  getEffectiveReminderDate,
  scheduleNotification,
  cancelNotification,
  rescheduleNextNotification,
} from "./useNotifications";
import { TodoItem } from "../types/todo";

describe("getEffectiveReminderDate", () => {
  test("прошлая дата -> now + 60s", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-26T10:00:00.000Z"));
    const past = new Date("2026-07-01T00:00:00.000Z");
    const result = getEffectiveReminderDate(past);
    expect(result.getTime()).toBe(new Date("2026-07-26T10:01:00.000Z").getTime());
    jest.useRealTimers();
  });

  test("будущая дата -> возвращается без изменений", () => {
    const future = new Date(Date.now() + 3600_000);
    expect(getEffectiveReminderDate(future)).toBe(future);
  });
});

describe("rescheduleNextNotification — не сдвигает repeatFrequency повторно", () => {
  test("планирует уведомление ровно на todo.reminderDate (без доп. сдвига)", async () => {
    const todo: TodoItem = {
      id: 1, title: "t", description: "d", lastUpdated: "2026-07-20",
      isRepeat: true, repeatFrequency: 7, size: 1,
      nextDate: "2026-07-27",
      reminderDate: "2026-07-27T09:30:00.000Z", // уже сдвинуто вызывающим кодом
      notificationId: "old-id",
    };

    await rescheduleNextNotification(todo);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("old-id");
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.date.toISOString()).toBe("2026-07-27T09:30:00.000Z");
  });
});
```

**Мок `expo-device` и `Platform.OS`** (нужен только если тесты также покрывают ветвление `Platform.OS === "android"` внутри `scheduleNotification`):
```typescript
// вариант А: прямое присвоение (документированный community-паттерн)
import { Platform } from "react-native";
beforeEach(() => { Platform.OS = "android"; });

// вариант B: полный jest.mock модуля Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "android",
  select: jest.fn((obj) => obj.android),
}));
```
[CITED: thewebdev.info/how-to-mock-platform-detection-in-jest-and-react-native — оба паттерна документированы как рабочие; `Platform` — обычный экспортируемый объект, не заморожен]

### Pattern 4: Официальный in-memory AsyncStorage mock (TEST-04)
**What:** `@react-native-async-storage/async-storage/jest/async-storage-mock` — модуль, реально хранящий данные в объекте `__INTERNAL_MOCK_STORAGE__` (не просто заглушки), с `getItem`/`setItem`/`multiGet`/`clear` и т.д. Подтверждён присутствующим в тарболе версии `2.2.0`, установленной в проекте [VERIFIED: npm registry tarball inspection выполнена в этой сессии].
**When to use:** Всегда для тестирования кода, читающего/пишущего AsyncStorage — не нужен собственный `__mocks__/@react-native-async-storage/async-storage.ts`.
**Example:**
```typescript
// storage/todoStorage.test.ts
// Source: официальный jest-mock, путь и механизм подтверждены распаковкой
// тарбола @react-native-async-storage/async-storage@2.2.0 в этой сессии
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveTodos, loadTodos, addTodo, removeTodo, updateTodo } from "./todoStorage";
import { TodoItem } from "../types/todo";

beforeEach(async () => {
  await AsyncStorage.clear(); // сброс in-memory store между тестами
});

test("loadTodos: пустой storage -> []", async () => {
  expect(await loadTodos()).toEqual([]);
});

test("saveTodos/loadTodos: round-trip сериализации", async () => {
  const todos: TodoItem[] = [{
    id: 1, title: "t", description: "d", lastUpdated: "",
    isRepeat: false, repeatFrequency: 0, nextDate: "2026-07-26", size: 1,
  }];
  await saveTodos(todos);
  expect(await loadTodos()).toEqual(todos);
});

test("loadTodos: битый JSON -> пробрасывает ошибку (контракт BUGF-02)", async () => {
  await AsyncStorage.setItem("TODOS", "{not valid json");
  await expect(loadTodos()).rejects.toBeInstanceOf(SyntaxError);
});

test("addTodo: новая задача добавляется в начало списка", async () => {
  const first: TodoItem = { id: 1, title: "a", description: "", lastUpdated: "", isRepeat: false, repeatFrequency: 0, nextDate: "2026-07-26", size: 1 };
  const second: TodoItem = { ...first, id: 2, title: "b" };
  await saveTodos([first]);
  const result = await addTodo(second);
  expect(result[0].id).toBe(2);
  expect(result[1].id).toBe(1);
});
```

### Anti-Patterns to Avoid
- **Не мокать `expo-notifications` через нативный automock jest-expo:** он рассчитан только на предотвращение краша (методы резолвятся в `undefined`), не даёт удобной поверхности для `.mock.calls`/`.mockResolvedValueOnce`. Всегда используйте явный `jest.mock("expo-notifications", () => ({...}))`.
- **Не переопределять `transformIgnorePatterns` вручную поверх `preset: "jest-expo"`:** сам preset уже программно задаёт корректный `transformIgnorePatterns` (проверено чтением `jest-expo/jest-preset.js` версии `54.0.17`); ручное добавление ключа в `package.json` **заменит** (не смёржит) массив пресета, если не скопировать его целиком.
- **Не ставить `jest@latest` (30.x) рядом с `jest-expo@54.x`:** внутренние зависимости `jest-expo` пином `^29.2.1`, несовпадение веток вызывает предупреждение "Multiple versions of Jest were found" и потенциальные конфликты `jest-environment-jsdom`.
- **Не тестировать `useNotifications()` как хук ради тестирования 4 стандалон-функций:** избыточно и требует RNTL `renderHook` + `act`, хотя функции вызываются напрямую.
- **Не полагаться на fake timers там, где функция уже принимает `now` параметром** (`isExpired`/`isToday`/`isFuture`/`filterDisplayedTodos`) — излишняя сложность; фикс времени только там, где функция реально читает `new Date()`/`Date.now()` внутри (`getEffectiveReminderDate`, `parseTime` — частично, см. Pitfall ниже).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Мок AsyncStorage | Свой `__mocks__/@react-native-async-storage/async-storage.ts` с ручными `Map`/`jest.fn()` | `@react-native-async-storage/async-storage/jest/async-storage-mock` (официальный, уже в составе установленного пакета `2.2.0`) | Официальный мок покрывает `multiGet`/`multiSet`/`multiMerge`/`useAsyncStorage` — edge-cases, которые легко упустить в самодельном моке |
| Babel/TS-транспиляция тестов | Ручной `babel.config.js` + `ts-jest` | `preset: "jest-expo"` (включает babel-preset и type-stripping, согласовано с Metro) | Явно запрещено D-03 — рассинхрон транспиляции тестов и рантайма Expo |
| Определение платформы для `Platform.OS === "android"` веток | Кастомный module mock с ручной эмуляцией `Platform.select` | Прямое присвоение `Platform.OS = "android"` в `beforeEach` или `jest.mock("react-native/Libraries/Utilities/Platform", ...)` — оба паттерна документированы сообществом | RN уже экспортирует простой объект; переизобретать API не нужно |

**Key insight:** В этом домене (Expo/RN тестирование) практически всё уже решено официальными инструментами — единственная реальная работа планировщика/исполнителя — правильно **выбрать совместимые версии** (jest 29 vs 30) и **не продублировать** то, что jest-expo уже настраивает из коробки (transformIgnorePatterns, native automocks).

## Common Pitfalls

### Pitfall 1: Несовпадение версий `jest` и `jest-expo` («Multiple versions of Jest were found»)
**What goes wrong:** Если поставить `jest@latest` (30.x) рядом с `jest-expo@54.x`, у которого внутренние зависимости (`jest-environment-jsdom`, `babel-jest`, `jest-snapshot`, `@jest/globals`) зафиксированы на `^29.2.1`, npm устанавливает два разных дерева версий `jest`-экосистемы, и Jest выводит предупреждение о нескольких версиях, а иногда тесты падают с необъяснимыми ошибками резолва модулей.
**Why it happens:** `jest-expo` версионируется по номеру Expo SDK (54.x = SDK 54), а не синхронно с `jest`; переход `jest-expo` на `jest@30`-совместимые внутренние зависимости происходит с задержкой.
**How to avoid:** Устанавливать через `npx expo install jest-expo jest @types/jest --dev` (а не `npm install -D jest@latest`) — команда `expo install` разрешает версии, совместимые с текущим SDK. Если версии добавляются вручную — жёстко пинить `jest@^29.7.0` и `@types/jest@^29.5.14`.
**Warning signs:** Предупреждение "Multiple versions of Jest were found" в выводе `npm test`; `npm ls jest` показывает более одной версии в дереве.

### Pitfall 2: `react-test-renderer` не работает с React 19
**What goes wrong:** `react-test-renderer` официально deprecated и выдаёт console warning при вызове `ReactTestRenderer.create()` под React 19; в проекте установлен React `19.1.0`.
**Why it happens:** React team отказалась от `react-test-renderer` в пользу `@testing-library/react-native` для RN.
**How to avoid:** Использовать только `@testing-library/react-native@^14.0.1` (не напрямую `react-test-renderer`); RNTL v14 сама подтягивает пир-замену `test-renderer@^1.0.0`.
**Warning signs:** Console warning про deprecated API при запуске тестов, использующих `react-test-renderer` напрямую.

### Pitfall 3: Асинхронный API RNTL v14 — забытый `await`
**What goes wrong:** В RNTL v14 `render`, `renderHook`, `fireEvent`, `act` возвращают `Promise` — если не поставить `await`, тест «проходит» (не падает синхронно), но ассерты выполняются до завершения рендера/эффектов, давая ложно-позитивный или неопределённый результат.
**Why it happens:** Major breaking change v14 (async-first API под React 19 Suspense/`use()`).
**How to avoid:** Явно помечать тестовые функции `async` и `await` каждый вызов `render`/`renderHook`/`fireEvent`. (В TEST-01..04 из этой фазы RNTL реально не используется — актуально только если планировщик позже добавит рендер-тесты компонентов.)
**Warning signs:** Тест зелёный, но снапшот/DOM не соответствует ожидаемому состоянию после действия.

### Pitfall 4: `jest.mock("expo-notifications")` без мока `SchedulableTriggerInputTypes` — падение при импорте
**What goes wrong:** `scheduleNotification` обращается к `Notifications.SchedulableTriggerInputTypes.DATE` (строка 42 файла) — если фабрика `jest.mock` не включает это поле, тест падает с `Cannot read properties of undefined (reading 'DATE')`.
**Why it happens:** `jest.mock("expo-notifications", factory)` полностью заменяет модуль — экспортируется только то, что явно перечислено в фабрике.
**How to avoid:** Всегда включать `SchedulableTriggerInputTypes: { DATE: "date" }` и `setNotificationHandler: jest.fn()` (последний вызывается на верхнем уровне модуля при импорте — строка 9 файла — и без мока тоже упадёт при `import`).
**Warning signs:** `TypeError` при импорте `hooks/useNotifications.ts` в тестовом файле.

### Pitfall 5: `getEffectiveReminderDate` читает реальное «сейчас» — нужен fake timer именно здесь
**What goes wrong:** В отличие от `todoFilters.ts`/`recurrence.ts` (принимают `now`/`base` параметром), `getEffectiveReminderDate` (строка 19-24 `useNotifications.ts`) использует `new Date()`/`Date.now()` напрямую — без `jest.useFakeTimers().setSystemTime(...)` тест на границе «прошлое/будущее» станет time-dependent (flaky/недетерминированным при медленном CI).
**Why it happens:** Функция не была спроектирована с инъекцией `now` (в отличие от утилит `todoFilters.ts`, где это решение принято явно в Phase 3).
**How to avoid:** Оборачивать такие тесты в `jest.useFakeTimers().setSystemTime(fixedDate)` / `jest.useRealTimers()` после теста. НЕ применять fake timers ко всему test-файлу целиком без необходимости — увеличивает риск непредсказуемых side-эффектов в других тестах того же файла.
**Warning signs:** Тест иногда падает без изменений в коде (граничное условие `date <= new Date()` зависит от миллисекунд выполнения).

### Pitfall 6: `parseTime` неявно использует «сегодня» для года/месяца/дня
**What goes wrong:** `parseTime` (строка 12 `utils/time.ts`) создаёт `new Date()` и выставляет только часы/минуты — date-компонент результата всегда «сегодня» на момент запуска теста. Если тест сравнивает результат через `toEqual(new Date(...))` с захардкоженной датой, тест сломается на следующий день.
**Why it happens:** Функция спроектирована только для извлечения часов/минут (используется совместно с `formatTime`), date-часть — побочный артефакт реализации.
**How to avoid:** В тестах на `parseTime` сравнивать только `getHours()`/`getMinutes()` (или прогонять через `formatTime` обратно и сравнивать строки), не полагаться на конкретную дату результата.
**Warning signs:** Тест проходит локально, но падает в CI на другой день / после полуночи.

### Pitfall 7: `date-fns@^4.1.0` — ESM/CJS dual-package, но резолвится корректно
**What goes wrong:** `date-fns@4.1.0` имеет `"type": "module"` в своём `package.json`, что иногда пугает при чтении конфигурации, наводя на мысль о необходимости добавлять его в `transformIgnorePatterns`.
**Why it happens:** Пакет — dual ESM/CJS (conditional exports), но `main` указывает на `index.cjs`, и Node/Jest резолвят `require()` в CJS-сборку автоматически.
**How to avoid:** Ничего специально делать не нужно — `date-fns` уже разрешается корректно через стандартный CJS require jest'а. Добавлять в `transformIgnorePatterns` НЕ требуется.
**Warning signs:** `SyntaxError: Cannot use import statement outside a module` при импорте `date-fns` — если увидено, значит резолвится не та ветка exports; решение — проверить версию `date-fns` в `node_modules` соответствует `package.json`, не трогать `transformIgnorePatterns`.

## Code Examples

См. блоки кода внутри § Architecture Patterns (Pattern 1–4) — это и есть проверенные шаблоны для TEST-01..04, построенные на прямом чтении исходников модулей в этой сессии.

### package.json — минимальная конфигурация (Wave 0)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "devDependencies": {
    "jest-expo": "^54.0.17",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "@testing-library/react-native": "^14.0.1"
  }
}
```
`"test"` — единичный прогон (используется как gate для валидации, exit code 0/1); `"test:watch"` — dev-цикл (`--watchAll`, как в официальной документации Expo).

### tsconfig.json — типы jest
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"]
  }
}
```
[CITED: docs.expo.dev/develop/unit-testing — "For TypeScript projects, update tsconfig.json"]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|--------------------|----------------|--------|
| `react-test-renderer` для снапшот/рендер-тестов RN-компонентов | `@testing-library/react-native` (async API, v14) | React 19 release (2026, RNTL v14 в июне 2026) | `react-test-renderer` deprecated, console warning под React 19; RNTL v14 — единственный официально рекомендованный путь |
| Синхронный RNTL API (`render()` возвращает объект напрямую) | Асинхронный API (`render()`/`renderHook()`/`fireEvent()`/`act()` возвращают `Promise`) | RNTL v14 (июнь 2026) | Любые будущие рендер-тесты компонентов (вне текущей фазы) должны писаться с `await` |
| Ручной `transformIgnorePatterns` в каждом консьюмер-проекте | `jest-expo` preset уже включает актуальный паттерн программно | Давно (актуально для текущей 54.x ветки, проверено чтением исходников) | Убирает необходимость копировать/поддерживать regex вручную |

**Deprecated/outdated:**
- `react-test-renderer`: помечен deprecated в самом npm-описании пакета; будет удалён в будущих версиях React — не использовать напрямую в новых тестах.
- `mock-async-storage` (community npm-пакет): не нужен — официальный мок уже в составе `@react-native-async-storage/async-storage`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|-----------------|
| A1 | Выбор `"jest": { "preset": "jest-expo" }` в `package.json` (а не отдельный `jest.config.js`) — рекомендация исследования, а не строгое требование Expo | § Standard Stack, § Recommended Project Structure | Низкий — оба варианта официально поддерживаются, решение явно оставлено на усмотрение агента (Discretion в CONTEXT.md) |
| A2 | Регрессионный тест-пример в Pattern 2 (`nextRecurrenceDate` от результата предыдущего вызова) иллюстрирует контракт «не звать дважды», но не является дословной копией бага из debug-документа (баг был в `useNotifications.ts`, не в `recurrence.ts`) | § Architecture Patterns Pattern 2 | Низкий — концептуально верно отражает контракт «единственный сдвиг», но планировщик должен также явно закрепить тест на уровне `rescheduleNextNotification` (см. Pattern 3), что и сделано |
| A3 | Мок `Platform.OS = "android"` через прямое присваивание может не сработать на будущих версиях RN, если `Platform` станет `Object.freeze`d — на RN 0.81.5 подтверждено сообществом как рабочий паттерн, но не протестировано лично в этом проекте | § Architecture Patterns Pattern 3 | Средний — если тест на android-ветку `scheduleNotification` понадобится и не сработает, есть fallback через `jest.mock("react-native/Libraries/Utilities/Platform", ...)`, указанный как альтернатива |

**Если план должен подтвердить решения перед выполнением:** A1 и A2 не требуют подтверждения пользователя (в рамках Discretion), A3 стоит проверить на этапе выполнения простым smoke-запуском теста, затрагивающего android-ветку (если такой тест будет написан).

## Open Questions

1. **Нужен ли явный тест на android-ветку `scheduleNotification` (флаг `exact: true`)?**
   - What we know: D-06 перечисляет `scheduleNotification`/`cancelNotification`/`rescheduleNextNotification`/`getEffectiveReminderDate` как цели TEST-03, не уточняя обязательность покрытия платформенной ветки.
   - What's unclear: Является ли `exact: true` для Android частью критичного контракта, требующего regression-теста, или это второстепенная деталь.
   - Recommendation: Включить один простой тест (Pattern 3, блок Platform mock) как «желательный», не блокирующий — платформенная ветка низкого риска (просто передача доп. поля в trigger).

2. **Нужен ли отдельный `jest.setup.js` для проекта или AsyncStorage-мок регистрируется по-файлово?**
   - What we know: Оба подхода официально документированы (inline `jest.mock` в тесте vs `setupFiles` в конфиге).
   - What's unclear: Будут ли другие тест-файлы (за пределами TEST-04) когда-либо нуждаться в AsyncStorage — если нет, inline в `todoStorage.test.ts` достаточно и проще.
   - Recommendation: Начать с inline `jest.mock` в `storage/todoStorage.test.ts` (меньше файлов, явная зависимость видна прямо в тесте); вынести в `setupFiles`, только если появится второй потребитель.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|-----------|
| Node.js | Запуск jest | ✓ | v22.15.1 | — |
| npm | Установка devDependencies | ✓ | 10.9.2 | — |
| `jest-expo` (npm registry) | D-01, все TEST-01..04 | ✓ (registry reachable, версия 54.0.17 подтверждена) | 54.0.17 | — |
| `jest` (npm registry) | D-01, D-02 | ✓ | 29.7.0 (рекомендуется, не latest 30.4.2) | — |
| `@testing-library/react-native` (npm registry) | D-01 (стек в целом) | ✓ | 14.0.1 | — |
| `@react-native-async-storage/async-storage` (уже в `dependencies`) | TEST-04 | ✓ (уже установлен, версия 2.2.0 совпадает с package.json) | 2.2.0 | — |
| Тестовая инфраструктура в проекте | Все TEST-01..04 | ✗ (отсутствует — greenfield gap) | — | Устанавливается в рамках Wave 0 этой же фазы, не блокер |

**Missing dependencies with no fallback:** нет.
**Missing dependencies with fallback:** тестовая инфраструктура целиком отсутствует, но это ожидаемо и устраняется первым Wave фазы (установка + конфигурация — не внешняя блокировка, а часть объёма работ).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `jest@^29.7.0` + preset `jest-expo@^54.0.17` |
| Config file | `package.json` → ключ `"jest": { "preset": "jest-expo" }` (Wave 0 — создаётся в этой фазе) |
| Quick run command | `npx jest <path/to/file>.test.ts` |
| Full suite command | `npm test` (маппится на `jest`, единичный non-watch прогон) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|----------------------|---------------|
| TEST-01 | `isExpired`/`isToday`/`isFuture` — граница дня, `sortByDate` — порядок по `nextDate`, `filterDisplayedTodos` — showAll/сегодня-режим | unit | `npx jest utils/todoFilters.test.ts -x` | ❌ Wave 0 |
| TEST-01 | `parseTime` — валидный `"HH:mm"` → часы/минуты, невалидный ввод (`"25:00"`, `"abc"`, неполный формат) → `null`; `formatTime` — паддинг нулями | unit | `npx jest utils/time.test.ts -x` | ❌ Wave 0 |
| TEST-02 | `nextRecurrenceDate` — сдвиг ровно на `repeatFrequency` дней (не дважды); `nextReminderIso` — перенос времени суток, `undefined` при отсутствии `currentReminderDate` | unit | `npx jest utils/recurrence.test.ts -x` | ❌ Wave 0 |
| TEST-03 | `getEffectiveReminderDate` — прошлое → `now+60s`, будущее → без изменений; `rescheduleNextNotification` — отмена старого `notificationId`, планирование ровно на `todo.reminderDate` (без повторного сдвига); `scheduleNotification`/`cancelNotification` — корректные вызовы `expo-notifications` API | unit (с `jest.mock("expo-notifications")`) | `npx jest hooks/useNotifications.test.ts -x` | ❌ Wave 0 |
| TEST-04 | `saveTodos`/`loadTodos` round-trip; `loadTodos` на пустом storage → `[]`; `loadTodos` на битом JSON → проброс ошибки (BUGF-02); `addTodo`/`removeTodo`/`updateTodo` — корректная модификация списка | integration (official AsyncStorage in-memory mock) | `npx jest storage/todoStorage.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** запуск соответствующего файла теста (`npx jest <file> -x`).
- **Per wave merge:** `npm test` (полный набор).
- **Phase gate:** `npm test` зелёный (exit code 0, все `describe`/`test` блоки passed) перед `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `package.json` — devDependencies (`jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native`) + `"jest"` конфиг-ключ + скрипты `test`/`test:watch` — отсутствуют полностью.
- [ ] `tsconfig.json` — добавить `"types": ["jest"]`.
- [ ] `utils/todoFilters.test.ts`, `utils/time.test.ts`, `utils/recurrence.test.ts`, `hooks/useNotifications.test.ts`, `storage/todoStorage.test.ts` — ни один файл не существует.
- [ ] Общих `beforeEach`/fixtures пока нет — каждый тест-файл строит фикстуры (`makeTodo`) локально (co-located подход, без общего `jest.setup.js`, см. Open Question 2).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|-----------------|---------|---------------------|
| V2 Authentication | нет | Приложение локальное, без аккаунтов (см. REQUIREMENTS.md Out of Scope) |
| V3 Session Management | нет | Не применимо — нет сессий |
| V4 Access Control | нет | Не применимо — однопользовательское локальное приложение |
| V5 Input Validation | частично, уже закрыто в Phase 2 | Runtime-валидация `Size`/`repeatFrequency` уже реализована (BUGF-03); эта фаза лишь добавляет тесты на уже существующую логику дат/времени, новой поверхности ввода не создаёт |
| V6 Cryptography | нет | Не применимо — нет криптографии в этой фазе |

### Known Threat Patterns for stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Вредоносный/скомпрометированный npm-пакет из devDependencies (supply chain) | Tampering | Package Legitimacy Audit выполнен для всех новых devDependencies (см. выше); ни один `postinstall`-скрипт не обнаружен; `jest-expo` явно проверен как ложное срабатывание эвристики, а не реальный риск |
| Утечка данных через тестовые фикстуры, случайно закоммиченные с реальными пользовательскими данными | Information Disclosure | Все тестовые фикстуры в этой фазе — синтетические (`makeTodo(...)`), не содержат реальных пользовательских данных; приложение локальное, реальных пользовательских PII в репозитории нет |

Тестовая инфраструктура (`jest`/`jest-expo`/RNTL) — devDependency, не попадает в production-бандл приложения (JS-бандл, собираемый Metro/EAS Build), поэтому не расширяет реальную runtime-поверхность атаки.

## Sources

### Primary (HIGH confidence — VERIFIED via npm registry / прямой осмотр тарболов в этой сессии)
- `npm view jest-expo / jest / @testing-library/react-native / @types/jest / test-renderer / @react-native-async-storage/async-storage` (версии, `peerDependencies`, `dependencies`, `postinstall`, `time.created`) — выполнено 2026-07-26.
- Тарбол `jest-expo@54.0.17` (распакован и прочитан: `jest-preset.js`, `config/getPlatformPreset.js`, `src/index.js`, `src/preset/moduleMocks/expoModules.js`) — подтверждает встроенный `transformIgnorePatterns`, отсутствие JS-уровня automock для `expo-notifications`/`expo-device` (только native-биндинг), однопроектный (не multi-platform) дефолтный preset.
- Тарбол `@react-native-async-storage/async-storage@2.2.0` (распакован и прочитан: `jest/async-storage-mock.js`) — подтверждает точную семантику мока (`__INTERNAL_MOCK_STORAGE__`, `getItem` → `null` при отсутствии, `clear()`).
- Тарбол `react-native@0.81.5` (`jest-preset.js`) — подтверждает `testEnvironment: react-native-env.js`, `haste.defaultPlatform: 'ios'`.
- Исходники проекта, прочитанные целиком в этой сессии: `utils/todoFilters.ts`, `utils/time.ts`, `utils/recurrence.ts`, `hooks/useNotifications.ts`, `storage/todoStorage.ts`, `types/todo.ts`, `.planning/debug/recurring-notification-stops-after-complete.md`.

### Secondary (MEDIUM confidence — WebSearch/WebFetch, кросс-проверено с npm registry)
- docs.expo.dev/develop/unit-testing — установочные команды, `package.json`-конфигурация, `transformIgnorePatterns` пример, замечание про deprecated `react-test-renderer`.
- github.com/callstack/react-native-testing-library/releases — версия 14.0.1, требования (`react>=19`, `react-native>=0.78`), асинхронный API v14.
- react-native-async-storage.github.io (через WebSearch summary — прямой WebFetch вернул 404, но описание сошлось с прочитанным исходным кодом мока) — `jest.mock` синтаксис.
- thewebdev.info / oneuptime.com (WebSearch) — паттерны мока `Platform.OS`.

### Tertiary (LOW confidence — не перепроверено отдельно)
- Общее описание "Multiple versions of Jest were found" — паттерн подтверждён логически (пин-версии в `dependencies` жест-expo реально отличаются от latest jest), но точный текст предупреждения не воспроизведён в реальном прогоне (установка не выполнялась в рамках research-only ограничения).

## Metadata

**Confidence breakdown:**
- Standard stack (версии, совместимость): HIGH — все версии проверены напрямую через `npm view`/распаковку тарболов, а не только по training data.
- Architecture (module-level функции useNotifications, automock jest-expo): HIGH — подтверждено прямым чтением исходников проекта и jest-expo.
- Pitfalls (jest/jest-expo version skew, RNTL async API, Platform.OS mock): MEDIUM — логически обоснованы и подтверждены вторичными источниками, но не воспроизведены живым прогоном `npm install && npm test` (research-only ограничение этой фазы).

**Research date:** 2026-07-26
**Valid until:** 2026-08-25 (30 дней — Expo SDK/jest-expo патчи выходят часто; при планировании после этой даты стоит перепроверить `npm view jest-expo version`)
