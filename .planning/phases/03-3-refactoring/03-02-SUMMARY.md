---
phase: 03-3-refactoring
plan: 02
subsystem: ui
tags: [react-native, date-fns, recurrence, notifications, refactoring]

# Dependency graph
requires:
  - phase: 02
    provides: "utils/time.ts (parseTime/formatTime) — прецедент чистого модуля, использован внутри utils/recurrence.ts"
provides:
  - "utils/recurrence.ts — чистый модуль вычисления даты повторения и reminder (nextRecurrenceDate, nextReminderIso)"
  - "Todo.tsx: onTaskComplete и showAlertForExpiredTask используют единый источник правды для дат повторения"
affects: [04-testing, "unit-тесты для utils/recurrence.ts (TEST-02)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Чистые утилитарные модули без React-зависимостей для логики, требующей unit-тестов (utils/recurrence.ts по образцу utils/time.ts, utils/todoFilters.ts)"

key-files:
  created:
    - utils/recurrence.ts
  modified:
    - components/Todo/Todo.tsx

key-decisions:
  - "nextReminderIso поглощает бывший локальный помощник getUpdatedTime целиком (включая formatTime) — вызывающий код передаёт готовую строку reminderDate, а не заранее вычисленное reminderTime"
  - "Единственный сдвиг repeatFrequency происходит внутри nextRecurrenceDate; вызывающий код (Todo.tsx, rescheduleNextNotification) не прибавляет repeatFrequency повторно — предотвращает регрессию бага двойного сдвига"

patterns-established:
  - "utils/recurrence.ts: чистые функции вычисления дат повторения, покрываемые unit-тестами напрямую без renderHook (для Phase 4, TEST-02)"

requirements-completed: [REF-02]

coverage:
  - id: D1
    description: "utils/recurrence.ts создан как чистый модуль (без React), экспортирует nextRecurrenceDate и nextReminderIso, reminder возвращается в ISO-формате"
    requirement: "REF-02"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -n 'from \"react\"' utils/recurrence.ts (0 совпадений); grep -n 'yyyy-MM-dd HH:mm' utils/recurrence.ts (0 совпадений)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Ветка onTaskComplete «повторяющаяся, не просрочена» использует utils/recurrence.ts вместо inline addDays; поведение (Alert-текст, планирование уведомления, отсутствие двойного сдвига) идентично доrefactor-версии"
    requirement: "REF-02"
    verification:
      - kind: manual_procedural
        ref: "Ручная проверка на реальном устройстве: создание повторяющейся не просроченной задачи с напоминанием → выполнение → тот же Alert и то же время следующего уведомления без сдвига на лишний цикл"
        status: pass
    human_judgment: true
    rationale: "Поведенческая проверка планирования локальных уведомлений Expo требует наблюдения на реальном устройстве; подтверждена пользователем при прохождении tracer-чекпойнта (Task 1)"
  - id: D3
    description: "Обе ветки showAlertForExpiredTask («Сегодня» / «Дата в задаче») переведены на utils/recurrence.ts; getUpdatedTime и дублирующиеся inline-вычисления удалены из Todo.tsx; тексты/кнопки/порядок Alert сохранены дословно"
    requirement: "REF-02"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -n 'const getUpdatedTime' components/Todo/Todo.tsx (0); grep -n 'addDays(' components/Todo/Todo.tsx (0); grep -n \"format(new Date(todo.reminderDate)\" components/Todo/Todo.tsx (0)"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-07-25
status: complete
---

# Phase 3 План 2: Утилита recurrence.ts и упрощение onTaskComplete Summary

**Вынесено вычисление даты повторения и reminder в чистую утилиту `utils/recurrence.ts`; обе ветки `onTaskComplete` и обе ветки `showAlertForExpiredTask` в `Todo.tsx` используют единый источник правды, устраняя дублирование и риск повторного бага двойного сдвига `repeatFrequency`.**

## Performance

- **Duration:** ~15 мин (плюс ожидание ручной проверки на checkpoint)
- **Tasks:** 2
- **Files modified:** 2 (1 создан, 1 изменён)

## Accomplishments
- Создан чистый модуль `utils/recurrence.ts` без React-зависимостей: `nextRecurrenceDate(base, repeatFrequency)` и `nextReminderIso(nextDate, currentReminderDate?)`.
- Ветка `onTaskComplete` «повторяющаяся, не просрочена» переведена на утилиту; поведение (Alert-текст, планирование уведомления) подтверждено пользователем на реальном устройстве идентичным доrefactor-версии, включая отсутствие двойного сдвига `repeatFrequency`.
- Обе ветки `showAlertForExpiredTask` («Сегодня» и «Дата в задаче») переведены на ту же утилиту; локальный помощник `getUpdatedTime` и дублирующиеся inline-вычисления (`addDays`, `format(new Date(todo.reminderDate), 'HH:mm')`) удалены из `Todo.tsx`.

## Task Commits

Каждая задача закоммичена атомарно:

1. **Task 1: Создать utils/recurrence.ts и провести ветку «повторяющаяся, не просрочена» через утилиту (end-to-end)** - `965afa1` (feat)
2. **Task 2: Перевести обе ветки showAlertForExpiredTask на utils/recurrence.ts и удалить дублирование из Todo.tsx** - `15053e9` (refactor)

**Plan metadata:** будет добавлен отдельным коммитом `docs(03-02): complete plan`.

_Task 1 имел тип `tracer`: после коммита исполнение было остановлено на checkpoint для ручной проверки на реальном устройстве (см. раздел ниже); координатор подтвердил корректность поведения, после чего выполнение продолжилось с Task 2._

## Files Created/Modified
- `utils/recurrence.ts` - чистый модуль: `nextRecurrenceDate` (единственное место сдвига на `repeatFrequency`), `nextReminderIso` (перенос времени суток на новую дату, возврат ISO, поглощает бывший `getUpdatedTime`)
- `components/Todo/Todo.tsx` - `onTaskComplete` (ветка «повторяющаяся, не просрочена») и обе ветки `showAlertForExpiredTask` используют утилиту; удалён `getUpdatedTime` и дублирующиеся вычисления дат; убраны ставшие лишними импорты `addDays`, `parseTime`

## Decisions Made
- `nextReminderIso` целиком поглощает бывшую комбинацию «вызывающий код вычисляет `reminderTime` через `formatTime` → передаёт в `getUpdatedTime`»: теперь утилита сама вызывает `formatTime` внутри, вызывающему коду достаточно передать `currentReminderDate` как есть. Это дополнительно сокращает дублирование сверх минимально требуемого планом (D-04/D-05), не меняя наблюдаемое поведение.
- Единственный сдвиг `repeatFrequency` происходит строго внутри `nextRecurrenceDate`; ни `Todo.tsx`, ни `rescheduleNextNotification` (не изменялся в этом плане) не прибавляют `repeatFrequency` повторно — контракт из `.planning/debug/recurring-notification-stops-after-complete.md` сохранён.

## Deviations from Plan

None - план выполнен точно как написан.

## Issues Encountered

None.

## User Setup Required

None - конфигурация внешних сервисов не требуется.

## Next Phase Readiness

- `utils/recurrence.ts` — чистый модуль, готов к прямому unit-тестированию в Phase 4 (TEST-02) без моков React.
- `Todo.tsx` больше не содержит дублирующейся логики вычисления дат повторения; все четыре ветки (`onTaskComplete` × 2, `showAlertForExpiredTask` × 2) используют единый источник правды.
- REF-02 выполнена полностью. Behavior-preserving подтверждено ручной проверкой на реальном устройстве для ветки Task 1; ветки Task 2 используют идентичную утилиту и не меняют тексты/кнопки/порядок Alert (проверено статически через grep и `tsc`).

---
*Phase: 03-3-refactoring*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: utils/recurrence.ts
- FOUND: components/Todo/Todo.tsx
- FOUND: 965afa1
- FOUND: 15053e9
