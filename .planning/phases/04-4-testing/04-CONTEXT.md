# Phase 4: 4-testing - Context

**Gathered:** 2026-07-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 покрывает код автоматическими тестами для стабилизации изменений после рефакторинга Phase 3. Четыре зафиксированных требования: **TEST-01** (unit-тесты утилит дат и фильтрации), **TEST-02** (unit-тесты логики завершения задачи), **TEST-03** (unit-тесты `useNotifications` с моками Expo Notifications), **TEST-04** (интеграционные тесты `storage/todoStorage.ts`).

Границы зафиксированы ROADMAP.md и REQUIREMENTS.md. В проекте сейчас нет тестовой инфраструктуры вообще (см. `.planning/codebase/TESTING.md`), поэтому фаза включает первичную настройку тест-раннера. E2E (Detox/Appium), CI и пороги покрытия — вне области (см. Deferred).

</domain>

<decisions>
## Implementation Decisions

### Тест-фреймворк и раннер
- **D-01:** Используется **`jest-expo`** (официальный preset Expo под SDK ~54) + **`@testing-library/react-native`** (RNTL) для тестов, требующих рендера компонентов. НЕ голый jest и НЕ vitest — jest-expo из коробки даёт корректные transform для `react-native`/`expo` и native-моки, что критично для RN 0.81/React 19. — **Reversibility:** costly — смена раннера позже затрагивает конфиг и все тест-файлы.
- **D-02:** Тест-раннер и зависимости ставятся как `devDependencies`; добавляются npm-скрипты `test` и `test:watch` в `package.json`. Конфигурация jest — через preset `jest-expo` (`jest.config` или ключ `jest` в package.json на усмотрение агента).
- **D-03:** TypeScript-трансформация тестов — через babel-preset, поставляемый jest-expo (не ts-jest), чтобы согласоваться с транспиляцией Expo.

### Объём и приоритет тестов
- **D-04 (TEST-01):** Unit-тесты для чистых утилит: `utils/todoFilters.ts` (`isExpired`/`isToday`/`isFuture`/`sortByDate`/`filterDisplayedTodos`) и `utils/time.ts` (`parseTime`/`formatTime`). Это чистые функции без React — тестируются напрямую, без рендера/моков. Покрыть edge-cases (граница дат, невалидный ввод времени → `null`, порядок сортировки).
- **D-05 (TEST-02):** «Логика завершения задачи» тестируется в первую очередь на **чистой утилите `utils/recurrence.ts`** (`nextRecurrenceDate`/`nextReminderIso`), вынесенной в Phase 3. Обязательный кейс — защита от регрессии бага двойного сдвига `repeatFrequency` (сдвиг ровно на одну частоту; см. `.planning/debug/recurring-notification-stops-after-complete.md`). Тестирование ветвления `onTaskComplete` внутри `Todo.tsx` через RNTL — НЕ в области этой фазы (см. Deferred), т.к. основная логика уже чистая.
- **D-06 (TEST-03):** Unit-тесты `hooks/useNotifications.ts` (`scheduleNotification`, `cancelNotification`, `rescheduleNextNotification`, `getEffectiveReminderDate`) с моком `expo-notifications` через `jest.mock("expo-notifications")` — фейковые `scheduleNotificationAsync`/`cancelScheduledNotificationAsync`, проверка `getEffectiveReminderDate` (прошлое → now+60с) и отсутствия двойного сдвига в `rescheduleNextNotification`.
- **D-07 (TEST-04):** Интеграционные тесты `storage/todoStorage.ts` (`saveTodos`/`loadTodos`/`addTodo`/`removeTodo`/`updateTodo`) с **официальным in-memory jest-моком** `@react-native-async-storage/async-storage` (`.../jest/async-storage-mock`). Edge-cases из TESTING.md: пустой storage, битый JSON (проброс ошибки — контракт BUGF-02), round-trip сериализации.

### Мокирование
- **D-08:** Нативные модули мокаются **официальными / in-memory** средствами, а не кастомными: AsyncStorage — официальный jest-мок; `expo-notifications` — `jest.mock` с фейковыми функциями. Кастомные `__mocks__` — только если официального мока нет.

### Claude's Discretion
- Точная структура тест-файлов (`*.test.ts` рядом с модулем vs `__tests__/`) и организация — на усмотрение планировщика/исполнителя (соглашение проекта отсутствует; см. Established Patterns).
- Расположение jest-конфига (отдельный файл vs `package.json`), setup-файлы (jest.setup) — на усмотрение агента.
- Конкретный набор edge-case ассертов на модуль — за агентом, при покрытии перечисленных в D-04…D-07 контрактов.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Требования и roadmap
- `.planning/ROADMAP.md` § Phase 4 — Goal, Context, Success criteria (unit-тесты утилит/фильтрации, логики завершения, useNotifications с моками, интеграционные для todoStorage).
- `.planning/REQUIREMENTS.md` § Testing — TEST-01, TEST-02, TEST-03, TEST-04.
- `.planning/codebase/TESTING.md` — текущее состояние (нет инфраструктуры) и раздел «Что тестировать в первую очередь».

### Тестируемые модули (после Phase 3)
- `utils/todoFilters.ts` — чистые предикаты/фильтр (TEST-01).
- `utils/time.ts` — `parseTime`/`formatTime` (TEST-01).
- `utils/recurrence.ts` — `nextRecurrenceDate`/`nextReminderIso` (TEST-02); связано с багом двойного сдвига.
- `hooks/useNotifications.ts` — планирование/отмена/reschedule (TEST-03).
- `storage/todoStorage.ts` — AsyncStorage CRUD (TEST-04).
- `types/todo.ts` — `TodoItem`, `Size` (типы для фикстур).
- `.planning/debug/recurring-notification-stops-after-complete.md` — контракт «единственный сдвиг repeatFrequency», обязательный регрессионный кейс.

### Внешние ссылки (для research/установки)
- jest-expo (Expo docs «Unit testing with Jest») — preset под текущий SDK.
- `@testing-library/react-native` — для тестов с рендером.
- `@react-native-async-storage/async-storage` официальный jest-мок (`.../jest/async-storage-mock`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Чистые утилиты из Phase 2/3 (`utils/time.ts`, `utils/todoFilters.ts`, `utils/recurrence.ts`) спроектированы тестируемыми (без React, детерминированные) — прямые цели unit-тестов.
- `types/todo.ts` — `TodoItem`/`Size` для типобезопасных фикстур в тестах.

### Established Patterns
- Соглашения об именовании тестов в проекте отсутствуют (тестов нет) — планировщик задаёт паттерн (`*.test.ts` рядом с модулем — предпочтительно для co-location, либо `__tests__/`).
- Именование утилит/хранилища — `camelCase.ts`; тест-файлы следуют тому же имени модуля.

### Integration Points
- `storage/todoStorage.ts` → AsyncStorage (мок in-memory для TEST-04).
- `hooks/useNotifications.ts` → `expo-notifications` + `expo-device` + `Platform` (моки для TEST-03).
- `utils/recurrence.ts` ↔ `hooks/useNotifications.ts` (`rescheduleNextNotification`) — совместно определяют корректность единственного сдвига `repeatFrequency`; тесты должны закрепить это на обеих сторонах.

</code_context>

<specifics>
## Specific Ideas

- Обязательный регрессионный тест: завершение повторяющейся задачи сдвигает дату ровно на `repeatFrequency` (не дважды) — и на уровне `utils/recurrence.ts`, и на уровне `rescheduleNextNotification`.
- Целевые тест-модули (ориентировочно): `utils/todoFilters.test.ts`, `utils/time.test.ts`, `utils/recurrence.test.ts`, `hooks/useNotifications.test.ts`, `storage/todoStorage.test.ts`.

</specifics>

<deferred>
## Deferred Ideas

- **Тесты компонентов через RNTL** (ветвление `onTaskComplete` в `Todo.tsx`, рендер карточек/модалки, Alert-флоу) — вне TEST-02 этой фазы; кандидат в отдельную фазу, если понадобится покрытие UI-логики.
- **Пороги покрытия (coverage thresholds) и CI (GitHub Actions)** — вне v1-цели «покрыть код тестами»; отдельная задача/бэклог.
- **E2E-тесты (Detox/Appium)** — вне области проекта на текущем этапе.

</deferred>

---

*Phase: 4-4-testing*
*Context gathered: 2026-07-25*
