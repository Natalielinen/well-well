---
phase: "01"
plan: "03"
type: auto
wave: 1
depends_on: []
requirements: [NOTF-04]
files_modified:
  - hooks/useNotifications.ts
  - App.tsx
autonomous: true
must_haves:
  truths:
    - NOTF-04: User sees an alert when notification scheduling fails
  prohibitions:
    - No console.error-only error handling in notification or storage paths
---

# Plan 03: Replace silent console errors with user-visible error handling

## Objective

Make notification and storage errors visible to the user so failures are no longer silent.

## Tasks

```xml
<tasks>
  <task>
    <name>Surface notification and storage errors</name>
    <files>
      - hooks/useNotifications.ts
      - storage/todoStorage.ts
      - App.tsx
    </files>
    <read_first>
      - hooks/useNotifications.ts
      - App.tsx
    </read_first>
    <action>
      Replace console.error in scheduleNotification and cancelNotification with Alert.alert showing a localized error message. Surface notification scheduling errors to the user via Alert.alert.
    </action>
    <acceptance_criteria>
      - hooks/useNotifications.ts uses Alert.alert on notification scheduling failure
      - App.tsx catches notification scheduling failures and alerts the user
    </acceptance_criteria>
    <done>
      grep -R "Alert.alert" hooks/useNotifications.ts App.tsx
    </done>
    <verify>
      grep -R "Alert.alert" hooks/useNotifications.ts App.tsx
    </verify>
  </task>
  <task>
    <name>Export notification helpers</name>
    <files>
      - hooks/useNotifications.ts
    </files>
    <read_first>
      - hooks/useNotifications.ts
    </read_first>
    <action>
      Export scheduleNotification and cancelNotification from useNotifications.ts so they are typed and testable.
    </action>
    <acceptance_criteria>
      - scheduleNotification and cancelNotification are exported functions with proper TypeScript signatures
    </acceptance_criteria>
    <done>
      grep -E "export (async )?function (scheduleNotification|cancelNotification)" hooks/useNotifications.ts
    </done>
    <verify>
      grep -E "export (async )?function (scheduleNotification|cancelNotification)" hooks/useNotifications.ts
    </verify>
  </task>
</tasks>
```

## Threat Model

**ASVS Level:** 1
**Block on:** High

| ID | Threat | Mitigation | Status |
|----|--------|------------|--------|
| T-05 | Silent failures leave user unaware of data loss | Surface all storage and notification errors via Alert.alert | Mitigated |

---
*Plan 03 created: 2026-07-16*
