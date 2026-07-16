# Summary: Plan 03

**Phase:** 01
**Plan:** 03
**Committed:** 2026-07-16

## Changes

- `hooks/useNotifications.ts`
  - Replaced `console.error` in `scheduleNotification` with `Alert.alert` so notification scheduling failures are user-visible.
  - Exported `scheduleNotification`, `cancelNotification`, and `rescheduleNextNotification` at module level for typing and testability.

- `App.tsx`
  - Added `try/catch` around `scheduleNotification` in `onAddTodo` and `onUpdateTodo`.
  - On failure, shows `Alert.alert("Ошибка", ...)` so the user sees the problem.

## Follow-up

- Add unit tests for error paths in `hooks/useNotifications.test.ts`.
- Verify alert behavior on a real device.
