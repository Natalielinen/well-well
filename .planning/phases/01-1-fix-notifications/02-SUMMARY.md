# Summary: Plan 02

**Phase:** 01
**Plan:** 02
**Committed:** 2026-07-16

## Changes

- `hooks/useNotifications.ts`
  - Exported `scheduleNotification`, `cancelNotification`, and `rescheduleNextNotification` at module level for typing and testability.
  - Added `rescheduleNextNotification(todo)` helper that cancels the old notification by saved id and schedules a new one for the next occurrence, handling past-dated reschedules.

- `components/Todo/Todo.tsx`
  - Replaced inline notification cancel/schedule logic in `handleCompleteTask` with `rescheduleNextNotification`.
  - Removed direct `cancelNotification`/`scheduleNotification` calls from task completion flow.

- `App.tsx`
  - Verified `onAddTodo` and `onUpdateTodo` assign returned `notificationId` to the saved task.

## Follow-up

- Add unit tests for `rescheduleNextNotification` in `hooks/useNotifications.test.ts`.
- Verify repeating tasks update their reminder after completion in a manual test.
