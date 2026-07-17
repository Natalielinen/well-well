---
phase: 02-2-fix-known-bugs
plan: 03
subsystem: storage
tags: [asyncstorage, error-handling, notifications]

requires:
  - phase: 02-2-fix-known-bugs
    provides: "Shared time utility (utils/time.ts)"
provides:
  - "Error-throwing storage functions (saveTodos, loadTodos)"
  - "Error-throwing notification functions (scheduleNotification, rescheduleNextNotification)"
affects: [02-2-fix-known-bugs]

tech-stack:
  added: []
  patterns: ["Fail-closed error propagation from storage and hooks to UI"]

key-files:
  created: []
  modified:
    - storage/todoStorage.ts
    - hooks/useNotifications.ts

key-decisions:
  - "Storage errors now throw instead of logging silently; UI components handle user-facing messages"
  - "Notification errors throw instead of showing Alert inside the hook; caller decides presentation"

patterns-established:
  - "Hooks and storage never show Alert or log user errors silently — they throw to the caller"

requirements-completed:
  - BUGF-02

coverage:
  - id: D1
    description: "Storage functions saveTodos and loadTodos throw errors instead of console.log"
    requirement: "BUGF-02"
    verification:
      - kind: automated_ui
        ref: "grep -c 'console.log' storage/todoStorage.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Notification functions scheduleNotification and rescheduleNextNotification throw errors instead of Alert.alert"
    requirement: "BUGF-02"
    verification:
      - kind: automated_ui
        ref: "grep -c 'Alert.alert' hooks/useNotifications.ts"
        status: pass
    human_judgment: false

duration: 4min
completed: 2026-07-17
status: complete
---

# Phase 02: Plan 03 — Error Propagation Summary

**Storage and notification errors throw to caller instead of silent logging or Alert**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-17T10:25:54Z
- **Completed:** 2026-07-17T10:29:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced console.log in storage/todoStorage.ts catch blocks with throw
- Removed Alert.alert from hooks/useNotifications.ts scheduleNotification, replaced with throw
- Removed unused Alert import from useNotifications.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Пробросить ошибки storage наружу** - `7182351` (fix)
2. **Task 2: Пробросить ошибки notifications наружу** - `a63e176` (fix)

**Plan metadata:** `a63e176` (docs: complete plan)

## Files Created/Modified
- `storage/todoStorage.ts` - Replaced console.log with throw in saveTodos and loadTodos
- `hooks/useNotifications.ts` - Replaced Alert.alert with throw in scheduleNotification, removed unused Alert import

## Decisions Made
- Storage errors now throw instead of logging silently; UI components handle user-facing messages
- Notification errors throw instead of showing Alert inside the hook; caller decides presentation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- None

## Next Phase Readiness
- Error propagation ready for Plan 04 validation additions
- Calling components may need updates to handle thrown errors (future phase)

---
*Phase: 02-2-fix-known-bugs*
*Completed: 2026-07-17*
