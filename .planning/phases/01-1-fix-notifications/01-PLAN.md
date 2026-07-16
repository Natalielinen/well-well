---
phase: "01"
plan: "01"
type: auto
wave: 1
depends_on: []
requirements: [NOTF-01]
files_modified:
  - hooks/useNotifications.ts
  - App.tsx
  - app.json
autonomous: true
must_haves:
  truths:
    - NOTF-01: scheduleNotification returns a valid notification id for past-dated reminders
    - NOTF-01: exact alarm permission exists in app.json
    - NOTF-01: notification channel uses IMPORTANCE_HIGH on Android
  prohibitions:
    - No silent return of undefined without user feedback when notification scheduling fails
---

# Plan 01: Fix notification scheduling edge cases

## Objective

Ensure notifications are always scheduled successfully, even when reminder times are in the past or edge-case dates. Fix Android exact-alarm and channel configuration to prevent delivery delays.

## Tasks

```xml
<tasks>
  <task>
    <name>Handle past-dated reminders</name>
    <files>
      - hooks/useNotifications.ts
      - App.tsx
    </files>
    <read_first>
      - hooks/useNotifications.ts
      - App.tsx
      - .planning/codebase/STACK.md
    </read_first>
    <action>
      Update scheduleNotification in hooks/useNotifications.ts so that if the reminder date is in the past or within 60 seconds, the notification is scheduled for Date.now() + 60_000ms instead of returning undefined.
    </action>
    <acceptance_criteria>
      - hooks/useNotifications.ts contains a guard that reschedules past reminders to Date.now() + 60000
      - Unit test asserts scheduleNotification returns an id for a past date
    </acceptance_criteria>
    <done>
      grep -R "Date.now() + 60000" hooks/useNotifications.ts && npx jest hooks/useNotifications.test.ts
    </done>
    <verify>
      npx jest hooks/useNotifications.test.ts
    </verify>
  </task>
  <task>
    <name>Verify Android exact-alarm and channel config</name>
    <files>
      - hooks/useNotifications.ts
      - app.json
    </files>
    <read_first>
      - hooks/useNotifications.ts
      - app.json
    </read_first>
    <action>
      Document exact-alarm and channel configuration: confirm SCHEDULE_EXACT_ALARM permission exists in app.json and IMPORTANCE_HIGH is set in useNotifications.ts.
    </action>
    <acceptance_criteria>
      - app.json contains SCHEDULE_EXACT_ALARM permission
      - hooks/useNotifications.ts sets channel importance to HIGH on Android
    </acceptance_criteria>
    <done>
      grep -R "SCHEDULE_EXACT_ALARM" app.json && grep -R "IMPORTANCE_HIGH" hooks/useNotifications.ts
    </done>
    <verify>
      grep -R "SCHEDULE_EXACT_ALARM" app.json && grep -R "IMPORTANCE_HIGH" hooks/useNotifications.ts
    </verify>
  </task>
</tasks>
```

## Threat Model

**ASVS Level:** 1
**Block on:** High

| ID | Threat | Mitigation | Status |
|----|--------|------------|--------|
| T-01 | Notification scheduling fails silently, user misses task | Surface errors via alert/toast and log to console.error | Mitigated |
| T-02 | Notification IDs collide or are reused incorrectly | Generate IDs via expo-notifications only; never reuse old IDs after cancel | Mitigated |

---
*Plan 01 created: 2026-07-16*
