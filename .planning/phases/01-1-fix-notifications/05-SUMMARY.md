---
phase: 01-1-fix-notifications
plan: "05"
subsystem: notifications
tags: [react-native, expo, notifications, date-fns, persistence]

# Dependency graph
requires:
  - phase: 01-1-fix-notifications
    provides: useNotifications.scheduleNotification с переносом прошедшей даты на Date.now() + 60000
provides:
  - Authoritative past-reminder normalization через getEffectiveReminderDate
  - scheduleNotification возвращает adjustedDate вместе с notificationId
  - rescheduleNextNotification возвращает adjustedDate вместе с notificationId
  - App.tsx persists adjustedDate в taskToSave.reminderDate
  - Todo.tsx persists adjustedDate при завершении повторяющейся задачи
affects: [01-1-fix-notifications, модал AddTodo, список задач]

# Tech tracking
tech-stack:
  added: []
  patterns: [authoritative date normalization helper, returning adjustedDate from scheduling functions, persisting adjusted date back to storage]

key-files:
  created: []
  modified:
    - hooks/useNotifications.ts
    - App.tsx
    - components/Todo/Todo.tsx

key-decisions:
  - "getEffectiveReminderDate добавлен как единая точка нормализации даты, чтобы scheduleNotification и rescheduleNextNotification не дублировали логику"
  - "scheduleNotification и rescheduleNextNotification возвращают adjustedDate, чтобы вызывающий код мог сохранить скорректированную дату в хранилище"
  - "App.tsx onAddTodo/onUpdateTodo записывают adjustedDate.toISOString() в taskToSave.reminderDate, поэтому хранилище и UI отражают rescheduled время"
  - "Todo.tsx handleCompleteTask записывает adjustedDate.toISOString() в updateTodo, поэтому при завершении повторяющейся задачи reminderDate обновляется"

patterns-established:
  - "Single helper getEffectiveReminderDate for past-date normalization"
  - "Scheduling functions return both notificationId and adjustedDate for caller persistence"

requirements-completed: [NOTF-01, NOTF-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "При создании/редактировании задачи с reminder в прошлом хранилище и UI отражают adjusted reminderDate = Date.now() + 60000"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "grep: adjustedDate.toISOString() присваивается taskToSave.reminderDate в App.tsx"
        status: pass
      - kind: other
        ref: "grep: adjustedDate.toISOString() присваивается reminderDate в updateTodo вызове в Todo.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "scheduleNotification возвращает adjustedDate вместе с notificationId"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "grep: getEffectiveReminderDate используется в scheduleNotification"
        status: pass
      - kind: other
        ref: "grep: return { notificationId, adjustedDate: effectiveDate } в scheduleNotification"
        status: pass
    human_judgment: false
  - id: D3
    description: "rescheduleNextNotification возвращает adjustedDate и persistence обновляет reminderDate в задаче"
    requirement: NOTF-02
    verification:
      - kind: other
        ref: "grep: return { notificationId, adjustedDate: effectiveDate } в rescheduleNextNotification"
        status: pass
      - kind: other
        ref: "grep: adjustedDate.toISOString() в handleCompleteTask Todo.tsx"
        status: pass
    human_judgment: false

# Metrics
duration: 5 min
completed: 2026-07-16
status: complete
---

# Phase 01 Plan 05: Authoritative past-reminder normalization and persistence Summary

**Added `getEffectiveReminderDate` helper, made `scheduleNotification`/`rescheduleNextNotification` return `adjustedDate`, and persisted the rescheduled reminder back into storage/UI via `App.tsx` and `Todo.tsx`.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-16T08:38:00Z
- **Completed:** 2026-07-16T08:43:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Добавлен helper `getEffectiveReminderDate(date: Date): Date` в `hooks/useNotifications.ts` — единая точка нормализации прошедшей даты на `Date.now() + 60000`.
- `scheduleNotification` теперь возвращает `{notificationId, adjustedDate}` вместо только `notificationId`, используя `getEffectiveReminderDate` для authoritative normalization.
- `rescheduleNextNotification` теперь возвращает `{notificationId, adjustedDate}` и использует `getEffectiveReminderDate` для нормализации `nextDate`.
- `App.tsx`: `onAddTodo` и `onUpdateTodo` деструктуризируют `adjustedDate` из `scheduleNotification` и записывают `adjustedDate.toISOString()` в `taskToSave.reminderDate` — хранилище и UI отражают rescheduled время.
- `Todo.tsx`: `handleCompleteTask` деструктуризирует `adjustedDate` из `rescheduleNextNotification` и записывает его в `updateTodo` — при завершении повторяющейся задачи `reminderDate` обновляется до rescheduled времени.

## Task Commits

Each task was committed atomically:

1. **Task 1: Authoritative normalization в useNotifications.ts и persistence в App.tsx** - `5d3d0a4` (fix)
2. **Task 2: Persist adjusted date в reschedule path и Todo.tsx** - included in same commit `5d3d0a4`

**Plan metadata:** (committed separately — see final commit)

## Files Created/Modified

- `hooks/useNotifications.ts` - добавлен `getEffectiveReminderDate`; `scheduleNotification` и `rescheduleNextNotification` возвращают `adjustedDate`
- `App.tsx` - `onAddTodo`/`onUpdateTodo` persist `adjustedDate.toISOString()` в `taskToSave.reminderDate`
- `components/Todo/Todo.tsx` - `handleCompleteTask` persist `adjustedDate.toISOString()` в `updateTodo`

## Decisions Made

- Helper `getEffectiveReminderDate` вынесен отдельно, чтобы избежать дублирования логики между `scheduleNotification` и `rescheduleNextNotification`.
- Функции scheduling возвращают объект с `notificationId` и `adjustedDate`, чтобы caller мог сохранить скорректированную дату.
- `App.tsx` persists adjusted date сразу после scheduling, до вызова `addTodo`/`updateTodo`.
- `Todo.tsx` persists adjusted date при завершении повторяющейся задачи через `updateTodo`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Gap G-1-4 закрыт: при создании/редактировании/завершении задачи с reminder в прошлом хранилище и UI отражают `Date.now() + 60000`.
- Рекомендуется ручная проверка: создать задачу с reminder в прошлом → проверить, что в списке задач отображается время `Date.now() + 60с`, а не исходное прошедшее.

---

*Phase: 01-1-fix-notifications*
*Completed: 2026-07-16*

## Self-Check: PASSED

- Файлы существуют: `hooks/useNotifications.ts` ✓, `App.tsx` ✓, `components/Todo/Todo.tsx` ✓, `05-SUMMARY.md` ✓
- Коммит присутствует: `5d3d0a4` ✓
- `getEffectiveReminderDate` присутствует в `useNotifications.ts` ✓
- `scheduleNotification` возвращает `adjustedDate` ✓
- `rescheduleNextNotification` возвращает `adjustedDate` ✓
- `onAddTodo`/`onUpdateTodo` записывают `adjustedDate.toISOString()` в `taskToSave.reminderDate` ✓
- `handleCompleteTask` записывает `adjustedDate.toISOString()` в `updateTodo` ✓
- `npx tsc --noEmit` без ошибок ✓
