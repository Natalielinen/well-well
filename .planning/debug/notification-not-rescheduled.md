# Debug Session: Notification not rescheduled for past reminder (Gap G-1-4)

- **Date:** 2026-07-16
- **Gap:** G-1-4 (major)
- **Phase:** 01-1-fix-notifications
- **Test:** 1 — "Повторяющаяся задача с reminder в прошлом доставляет уведомление"
- **Truth:** При создании задачи с reminder в прошлом уведомление должно быть перенесено на `Date.now() + 60с`.
- **User reported:** "не совпадает, задача создалась с уведомлением в прошлом".
- **Mode:** Investigation only. No fixes applied. No commits. (Worktree HEAD is `main` at base `ce0e9c9`; per guard #2924/#48 the sub-agent refuses to commit/rewrite — only this diagnostic report was written.)

## Summary

The blocking early return in `AddTodo.onCreate` was removed in commit `80e0dfd`, so the task now saves and the modal closes (G-1-1 resolved). The remaining defect: the reschedule to `Date.now() + 60000` **does happen at the trigger level but is invisible and non-persistent**, so from the user's perspective "задача создалась с уведомлением в прошлом".

## Flow Trace

1. **AddTodo.tsx:187** — `onCreate` builds `newTask.reminderDate = remindDate.toISOString()` using the **original past date** the user picked. This value is never adjusted.
2. **App.tsx:145-154** (`onAddTodo`) — reads `newTask.reminderDate`, converts to `Date`, calls `scheduleNotification(title, body, reminderDate)`, then stores `taskToSave.notificationId`. It saves `taskToSave` (which still carries the **original past** `reminderDate`) via `addTodo`.
3. **useNotifications.ts:20-49** (`scheduleNotification`) — the guard exists:
   ```ts
   if (date <= new Date()) {
     date = new Date(Date.now() + 60000);   // lines 25-27
   }
   ```
   This reassigns only the **local `date` parameter**. The `+60s` value is used solely for the notification `trigger.date` (line 39). It is never returned, never propagated back to `App.onAddTodo`, and never written to `reminderDate` in storage.

## Root Cause

The `Date.now() + 60000` reschedule is applied **only to a local variable inside `scheduleNotification`** (useNotifications.ts:26). The persisted/displayed `reminderDate` (set at AddTodo.tsx:187 and saved unchanged at App.tsx:154-160) remains the original **past** timestamp. Consequently:

- **UI evidence:** `components/Todo/Todo.tsx:223-232` renders `todo.reminderDate` directly (`formatDate(new Date(todo.reminderDate), "HH:mm")`). Because storage still holds the past date, the task visibly displays a reminder time in the past — exactly what the user reports.
- **Data evidence:** The rescheduled `+60s` value has no return channel. `scheduleNotification` returns only the notification `id`; the adjusted `date` is discarded after the `scheduleNotificationAsync` call. Nothing writes the adjusted date back into `taskToSave.reminderDate`.

So the truth ("уведомление должно быть перенесено на Date.now() + 60с") is only half-met: the OS trigger may be set to now+60s, but the app's own reminder state/UI still shows the past date, so the observable outcome is "notification in the past."

### Secondary contributing factor

Even the trigger-level reschedule is fragile/asymmetric across paths:
- `App.onAddTodo` (145-158) and `App.onUpdateTodo` (173-187) rely entirely on the guard inside `scheduleNotification`.
- `rescheduleNextNotification` (useNotifications.ts:72-74) independently re-implements the same `+60s` guard, and it also does **not** write the adjusted date back to `reminderDate` before calling `scheduleNotification`. So the completion path (Todo.tsx:46) has the same "stored reminder stays in the past" property.

This duplicated, non-persisted adjustment means there is no single source of truth for the effective reminder time, and the persisted `reminderDate` is never the rescheduled value.

## Evidence

- `hooks/useNotifications.ts:25-27` — guard mutates only local `date`; not returned, not persisted.
- `hooks/useNotifications.ts:44` — function returns only the notification `id`, discarding the adjusted `date`.
- `components/AddTodo/AddTodo.tsx:187` — `reminderDate` set to original past ISO string; no reschedule here.
- `App.tsx:145-160` — `onAddTodo` saves `taskToSave` with the unmodified past `reminderDate`; only `notificationId` is captured.
- `components/Todo/Todo.tsx:223-232` — UI renders `todo.reminderDate` (the past value) → user sees "уведомление в прошлом".
- `hooks/useNotifications.ts:72-76` — `rescheduleNextNotification` repeats the guard, also without persisting the adjusted date.
- Git: `80e0dfd` removed the blocking validation; `ce0e9c9` ("re-check after fix - notification still in past") confirms the symptom persists after the G-1-1 fix.

## Files Involved

- `hooks/useNotifications.ts` — reschedule to `Date.now()+60000` is local-only (25-27), not returned (44); `rescheduleNextNotification` duplicates the same non-persisted logic (72-76).
- `App.tsx` — `onAddTodo`/`onUpdateTodo` persist the original past `reminderDate`; do not use/store the rescheduled date.
- `components/AddTodo/AddTodo.tsx` — writes the original past `reminderDate` (187) with no normalization.
- `components/Todo/Todo.tsx` — displays `todo.reminderDate` (223-232), surfacing the past value to the user.

## Suggested Fix Direction (for plan-phase --gaps)

Make the `+60s` reschedule authoritative and persisted, not a hidden local mutation:
- Have `scheduleNotification` return (or expose) the effective scheduled `Date`, or compute the effective reminder date **before** calling it, so callers persist the adjusted date.
- In `App.onAddTodo`/`onUpdateTodo`, write the effective (possibly `Date.now()+60000`) date back into `taskToSave.reminderDate` so storage and `Todo.tsx` UI reflect the rescheduled time.
- Centralize the "past → now+60s" normalization in one place (a single helper) and reuse it in `rescheduleNextNotification` so all paths persist consistently.
