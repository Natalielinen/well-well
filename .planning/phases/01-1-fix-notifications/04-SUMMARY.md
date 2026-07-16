---
phase: 01-1-fix-notifications
plan: "04"
subsystem: ui
tags: [react-native, expo, addtodo, notifications, date-fns]

# Dependency graph
requires:
  - phase: 01-1-fix-notifications
    provides: useNotifications.scheduleNotification с переносом прошедшей даты на Date.now() + 60000
provides:
  - Удалён блокирующий early return по isBefore(remindDate, new Date()) в onCreate
  - Ошибки валидации (title/repeatFrequency/minDate) отображаются в JSX
affects: [01-1-fix-notifications, модал AddTodo]

# Tech tracking
tech-stack:
  added: []
  patterns: [рендеринг ошибок валидации из общего error-стейта перед actions]

key-files:
  created: []
  modified:
    - components/AddTodo/AddTodo.tsx
    - components/AddTodo/styles.ts

key-decisions:
  - "Блокирующая валидация прошедшего reminder удалена полностью (без soft-warning), чтобы поток доходил до сохранения задачи и onModalClose, как требует gap G-1-1"
  - "Отображение ошибок вынесено отдельным блоком перед actions; новый стиль errorText добавлен в styles.ts (colors.danger)"

patterns-established:
  - "Validation errors rendered from shared error state object above actions block"

requirements-completed: [NOTF-01]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Удалён блокирующий early return isBefore(remindDate, new Date()) в onCreate — задача сохраняется и модал закрывается при прошедшем reminder"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "grep: isBefore(remindDate, new Date()) отсутствует в AddTodo.tsx"
        status: pass
      - kind: automated_ui
        ref: "npx tsc --noEmit без ошибок в AddTodo"
        status: pass
    human_judgment: false
  - id: D2
    description: "Ошибки валидации error.title/error.repeatFrequency/error.minDate отображаются в JSX"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "grep: error.minDate/error.title/error.repeatFrequency присутствуют в JSX (AddTodo.tsx:373-382)"
        status: pass
      - kind: automated_ui
        ref: "npx tsc --noEmit без ошибок в AddTodo"
        status: pass
    human_judgment: false
  - id: D3
    description: "Логика переноса даты scheduleNotification (Date.now() + 60000) сохранена и достижима из onCreate"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "hooks/useNotifications.ts:25-27 не изменён, достижим через родительский вызов планирования"
        status: pass
    human_judgment: false

# Metrics
duration: 2 min
completed: 2026-07-16
status: complete
---

# Phase 01 Plan 04: Удаление блокирующей валидации прошедшего reminder Summary

**Удалён блокирующий early return по `isBefore(remindDate, new Date())` в `AddTodo.onCreate`, добавлен рендеринг ошибок валидации в JSX — задача сохраняется и модал закрывается при прошедшем reminder, уведомление переносится на `Date.now() + 60000`**

## Performance

- **Duration:** 2 min
- **Started:** 2026-07-16T08:34:11Z
- **Completed:** 2026-07-16T08:36:38Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Удалён блокирующий early return по `isBefore(remindDate, new Date())` в `onCreate` (строки 176-179) — поток доходит до `onAddTodo`/`onUpdateTodo` и `onModalClose` даже при прошедшем reminder.
- Добавлен рендеринг ошибок валидации `error.title`/`error.repeatFrequency`/`error.minDate` в JSX перед блоком actions; новый стиль `errorText` (красный `colors.danger`) добавлен в `components/AddTodo/styles.ts`.
- Логика переноса даты в `hooks/useNotifications.ts` (строки 25-27, `date = new Date(Date.now() + 60000)`) сохранена без изменений и теперь достижима из `onCreate`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Удалить блокирующую валидацию прошедшего reminder из onCreate** - `80e0dfd` (fix)
2. **Task 2: Отобразить ошибки валидации в JSX** - `bb0e547` (fix)

**Plan metadata:** (committed separately — see final commit)

## Files Created/Modified

- `components/AddTodo/AddTodo.tsx` - удалён блокирующий early return; добавлен блок рендеринга ошибок валидации перед actions
- `components/AddTodo/styles.ts` - добавлен стиль `errorText` (цвет `colors.danger`)

## Decisions Made

- Блокирующая валидация прошедшего reminder удалена без замены на soft-warning, так как gap G-1-1 требует, чтобы поток доходил до сохранения задачи и закрытия модала.
- `import isBefore` сохранён — он всё ещё используется для валидации `nextDate` (строка 168).
- `hooks/useNotifications.ts` не изменялся.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Gap G-1-1 закрыт: при прошедшем reminder задача сохраняется, модал закрывается, уведомление переносится на `Date.now() + 60000`.
- Рекомендуется ручная проверка (gap G-1-1, тест 1): открыть модал, включить «Напомнить?», выбрать время в прошлом, нажать «Сохранить» — задача должна сохраниться и модал закрыться.

---
*Phase: 01-1-fix-notifications*
*Completed: 2026-07-16*
