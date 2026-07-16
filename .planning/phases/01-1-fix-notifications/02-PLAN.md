---
phase: "01"
plan: "02"
type: auto
wave: 1
depends_on: []
requirements: [NOTF-02, NOTF-03]
files_modified:
  - App.tsx
  - hooks/useNotifications.ts
  - components/Todo/Todo.tsx
  - types/todo.ts
autonomous: true
must_haves:
  truths:
    - NOTF-02: Every repeating task has a notificationId matching the latest scheduled notification
    - NOTF-03: Editing a task cancels the old notification and creates a new one with the updated time
  prohibitions:
    - Do not overwrite a valid notificationId with undefined after successful scheduling
    - Do not leave stale notifications scheduled after a task is edited or deleted
---

# Plan 02: Fix notificationId lifecycle for repeating tasks

## Objective

Guarantee that notificationId stays in sync with the actual scheduled notification when a repeating task is created, edited, or completed.

## Tasks

```xml
<tasks>
  <task>
    <name>Persist notificationId on create and update</name>
    <files>
      - App.tsx
      - hooks/useNotifications.ts
      - types/todo.ts
    </files>
    <read_first>
      - App.tsx
      - hooks/useNotifications.ts
      - types/todo.ts
    </read_first>
    <action>
      Update App.tsx onAddTodo and onUpdateTodo so the returned notificationId is always assigned to taskToSave.notificationId. Do not leave it undefined when scheduleNotification succeeds.
    </action>
    <acceptance_criteria>
      - onAddTodo sets taskToSave.notificationId = notificationId after scheduleNotification
      - onUpdateTodo sets taskToSave.notificationId = notificationId after scheduleNotification
    </acceptance_criteria>
    <done>
      grep -A 5 "scheduleNotification" App.tsx
    </done>
    <verify>
      grep -A 5 "scheduleNotification" App.tsx
    </verify>
  </task>
  <task>
    <name>Reschedule next occurrence on task completion</name>
    <files>
      - components/Todo/Todo.tsx
      - hooks/useNotifications.ts
    </files>
    <read_first>
      - components/Todo/Todo.tsx
      - hooks/useNotifications.ts
      - types/todo.ts
    </read_first>
    <action>
      Export rescheduleNextNotification from hooks/useNotifications.ts and call it from Todo.tsx when a repeating task is marked complete. The helper cancels the old notification by saved id and schedules a new one for the next occurrence.
    </action>
    <acceptance_criteria>
      - hooks/useNotifications.ts exports rescheduleNextNotification(todo: TodoItem): Promise&lt;string | undefined&gt;
      - components/Todo/Todo.tsx calls rescheduleNextNotification when repeatFrequency is set and task is completed
    </acceptance_criteria>
    <done>
      grep -R "rescheduleNextNotification" hooks/useNotifications.ts components/Todo/Todo.tsx
    </done>
    <verify>
      grep -R "rescheduleNextNotification" hooks/useNotifications.ts components/Todo/Todo.tsx
    </verify>
  </task>
  <task>
    <name>Cancel old notification before editing</name>
    <files>
      - App.tsx
      - hooks/useNotifications.ts
      - components/Todo/Todo.tsx
    </files>
    <read_first>
      - App.tsx
      - hooks/useNotifications.ts
    </read_first>
    <action>
      Ensure onUpdateTodo always cancels the old notification by the saved notificationId before scheduling a new one. If the old notificationId is missing, log a warning but do not block saving.
    </action>
    <acceptance_criteria>
      - onUpdateTodo calls cancelNotification(oldTodo.notificationId) when oldTodo.notificationId exists
      - New notification is scheduled with the updated reminderDate
    </acceptance_criteria>
    <done>
      grep -B 2 -A 8 "cancelNotification" App.tsx
    </done>
    <verify>
      grep -B 2 -A 8 "cancelNotification" App.tsx
    </verify>
  </task>
</tasks>
```

## Threat Model

**ASVS Level:** 1
**Block on:** High

| ID | Threat | Mitigation | Status |
|----|--------|------------|--------|
| T-03 | Stale notification fires after task is edited or deleted | Cancel old notification by id before scheduling new | Mitigated |
| T-04 | Repeating task loses reminder after completion | Reschedule next occurrence immediately on complete | Mitigated |

---
*Plan 02 created: 2026-07-16*
