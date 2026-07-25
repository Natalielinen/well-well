# Phase 3: 3-refactoring - Context

**Gathered:** 2026-07-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 снижает технический долг и готовит код к тестированию (Phase 4). Три зафиксированных требования: **REF-01** (вынести бизнес-логику из `App.tsx` в хуки/утилиты), **REF-02** (упростить `onTaskComplete` в `Todo.tsx` и удалить дублирование `showAlertForExpiredTask`), **REF-03** (добавить cleanup и обработку ошибок во все `useEffect` в `App.tsx`).

Границы зафиксированы ROADMAP.md и REQUIREMENTS.md. Новые возможности (unit-тесты — Phase 4; функциональные фичи — v2) вне области. Рефакторинг проясняет **как** реструктурировать существующий код, а не **что** добавить.

</domain>

<decisions>
## Implementation Decisions

### REF-01 — Дробление App.tsx
- **D-01:** Бизнес-логика выносится из `App.tsx` в **кастомные хуки**, а не в `useReducer` или Context API. Целевые хуки: `useTodos` (state задач + CRUD + загрузка из storage: `getAllTodos`, `onAddTodo`, `onUpdateTodo`) и `useTodoFilters` (фильтрация/сортировка/предикаты дат). Согласуется с текущей архитектурой (проект уже использует `useNotifications` как кастомный хук, без state-management библиотек). — **Reversibility:** reversible — локальное структурное изменение внутри `App.tsx` и новых файлов хуков.
- **D-02:** Хуки размещаются в директории `hooks/` рядом с `useNotifications.ts` (соглашение `use`-префикс, `camelCase.ts`).

### Предикаты дат и фильтрация
- **D-03:** `isExpired` / `isToday` / `isFuture` / `sortByDate` / логика `displayedTodos` выносятся в **чистые функции** в отдельный модуль `utils/todoFilters.ts` (без React-зависимостей). Хук `useTodoFilters` вызывает эти функции. Причина: чистые функции напрямую покрываются unit-тестами в Phase 4 (TEST-01) без `renderHook`. Согласуется с прецедентом `utils/time.ts` из Phase 2.

### REF-02 — Упрощение onTaskComplete
- **D-04:** Вычисление следующей даты повторения и обновлённого reminder выносится в **чистую утилиту** `utils/recurrence.ts`. Обе ветки `onTaskComplete` и `showAlertForExpiredTask` используют её вместо дублирующегося вычисления дат. Причина: единый источник правды для логики повторения снижает риск повторения недавнего бага двойного сдвига `repeatFrequency` (см. `.planning/debug/recurring-notification-stops-after-complete.md`).
- **D-05:** Дублирование обновления дат между ветвями `onTaskComplete` и `showAlertForExpiredTask` устраняется за счёт общей утилиты из D-04; `showAlertForExpiredTask` перестаёт содержать собственную копию логики вычисления `nextDate`/reminder.

### Границы поведения
- **D-06:** Рефакторинг **behavior-preserving**: наблюдаемое поведение и UX (Alert-флоу, тексты, порядок задач, доставка уведомлений) не меняются, кроме изменений, прямо требуемых **REF-03**. Причина: перед покрытием тестами (Phase 4) структура меняется, поведение — нет; это делает тесты Phase 4 валидными как регрессионная сеть.
- **D-07 (REF-03):** Все `useEffect` в `App.tsx` получают cleanup (где применимо) и обработку ошибок в async-операциях. Точечные исправления, необходимые для корректности cleanup/ошибок (например, добавление корректного массива зависимостей к `useEffect`, который сейчас выполняется на каждый рендер — `MobileAds.initialize()`), допускаются как часть REF-03. Более широкие «попутные» фиксы, не связанные с cleanup/ошибками, в область не входят.

### Claude's Discretion
- Точные имена и сигнатуры хуков/утилит (`useTodos`, `useTodoFilters`, `utils/todoFilters.ts`, `utils/recurrence.ts`) и внутренняя декомпозиция — на усмотрение планировщика/исполнителя, при сохранении границ D-01…D-07.
- Мемоизация (`useMemo`/`useCallback`) при выносе логики — по месту, без изменения поведения.
- Форма чистых функций в `recurrence.ts` (одна функция vs несколько) — на усмотрение агента.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Требования и roadmap
- `.planning/ROADMAP.md` § Phase 3 — Goal, Context, Success criteria (логика вынесена из `App.tsx`; `onTaskComplete` упрощён; все `useEffect` с cleanup и обработкой ошибок; чёткие границы модулей).
- `.planning/REQUIREMENTS.md` § Refactoring — REF-01, REF-02, REF-03 (точные критерии).

### Технический долг (что именно рефакторить)
- `.planning/codebase/CONCERNS.md` — разделы «Монолит в App.tsx» (№1), «Логика завершения задачи в Todo.tsx» (№2), «Дублирование логики обновления reminder» (№3), «Асинхронность в useEffect» (хрупкая область №3), а также замечания о производительности (перезагрузка списка, re-render, date parsing в render).
- `.planning/codebase/ARCHITECTURE.md` — текущий паттерн (Monolith SPA, `App.tsx` как state holder) и слои.

### Исходный код (точки правок)
- `App.tsx` — весь `useState`, inline-логика фильтрации/сортировки/предикатов дат, несколько `useEffect` (BannerAdSize; `MobileAds.initialize()` без массива зависимостей; `getAllTodos` при монтировании; `setToday` по `selectedDate`), `onAddTodo`/`onUpdateTodo`/`getAllTodos`.
- `components/Todo/Todo.tsx` — `onTaskComplete` (4 ветки), `showAlertForExpiredTask` (дублирует вычисление дат), `handleCompleteTask`, `getUpdatedTime`.
- `hooks/useNotifications.ts` — прецедент кастомного хука; `rescheduleNextNotification` (потребитель логики повторения).
- `utils/time.ts` — прецедент чистого модуля утилит (`parseTime`/`formatTime`) из Phase 2.
- `types/todo.ts` — `TodoItem`, `Size`, `repeatFrequency`.
- `.planning/debug/recurring-notification-stops-after-complete.md` — контекст бага двойного сдвига `repeatFrequency`, которого касается D-04.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hooks/useNotifications.ts` — образец кастомного хука (структура, экспорт, cleanup listeners в `useEffect`); новые `useTodos`/`useTodoFilters` следуют этому стилю.
- `utils/time.ts` — образец чистого модуля утилит без React; `utils/todoFilters.ts` и `utils/recurrence.ts` согласуются с ним.
- `date-fns` — уже в зависимостях (`parse`, `format`, `isBefore`, `isAfter`, `isSameDay`, `startOfDay`, `addDays`); используется в предикатах дат и логике повторения.

### Established Patterns
- Хуки: `use`-префикс, директория `hooks/`. Утилиты: `camelCase.ts` в `utils/`.
- Все mutations задач проходят через `App.tsx` — после выноса они переезжают в `useTodos`, но контракт callback'ов вниз (в `Todo`, `AddTodo`) сохраняется (behavior-preserving, D-06).
- Смешение форматов дат (`yyyy-MM-dd` через `date-fns parse` в `App.tsx` vs `new Date()` в `Todo.tsx`) — известная хрупкость; при выносе предикатов в `utils/todoFilters.ts` использовать единый подход `date-fns parse` (в рамках behavior-preserving, без смены формата хранения).

### Integration Points
- `App.tsx` становится тонким контейнером: вызывает `useTodos` и `useTodoFilters`, прокидывает данные/колбэки в `Header`, `WeekStrip`, `FlatList`/`Todo`, `AddTodo`.
- `Todo.tsx` `onTaskComplete`/`showAlertForExpiredTask` → импортируют `utils/recurrence.ts`.
- `useTodoFilters` → импортирует `utils/todoFilters.ts`.

</code_context>

<specifics>
## Specific Ideas

- Целевые модули: `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `utils/todoFilters.ts`, `utils/recurrence.ts` (имена ориентировочные — см. Claude's Discretion).
- `App.tsx` после рефакторинга — преимущественно рендер + композиция хуков, без inline бизнес-логики.

</specifics>

<deferred>
## Deferred Ideas

- Оптимизации производительности из CONCERNS.md (инкрементальное обновление списка вместо полной перезагрузки, `extraData`/мемоизация `FlatList`) — выходят за рамки behavior-preserving рефакторинга REF-01…03; кандидаты в отдельную фазу/бэклог, если станут проблемой.
- Унификация форматов дат в хранилище (единый `yyyy-MM-dd`/ISO) — потенциально ломает совместимость данных; отдельное решение вне области Phase 3.

</deferred>

---

*Phase: 3-3-refactoring*
*Context gathered: 2026-07-25*
