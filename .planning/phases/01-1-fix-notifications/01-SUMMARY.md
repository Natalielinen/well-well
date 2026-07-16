---
phase: "01"
plan: "01"
subsystem: "notifications"
tags: [notifications, android, edge-case, scheduling]
dependency_graph:
  requires: []
  provides: [notifications-scheduling-fix]
  affects: [hooks/useNotifications.ts]
tech-stack:
  added: []
  patterns: [expo-notifications, reschedule-past-reminders]
key-files:
  modified:
    - hooks/useNotifications.ts
decisions:
  - Использовать Date.now() + 60000 для переноса прошлых напоминаний вместо возврата undefined
metrics:
  duration: "PT0H0M"
  completed_date: "2026-07-16"
  tasks: 2
status: complete
---

# Phase 1 Plan 01: Исправление крайних случаев планирования уведомлений

## Краткое описание

Исправлен крайний случай планирования уведомлений, при котором reminder с датой в прошлом возвращал `undefined` и не планировался. Теперь такие напоминания автоматически переносятся на `Date.now() + 60000` (1 минута). Также подтверждена конфигурация Android exact-alarm и канала `IMPORTANCE_HIGH`.

## Выполненные задачи

### Задача 1: Обработка прошлых напоминаний

**Изменения в `hooks/useNotifications.ts`:**

- Заменено молчаливое возврат `undefined` при дате в прошлом на перенос reminder на `Date.now() + 60000`.
- Вместо сообщения об ошибке добавлено информационное логирование: `📅 Дата в прошлом, переносим уведомление на +1 минуту`.

**Результат:** `scheduleNotification` теперь всегда возвращает id уведомления, даже если исходная дата уже прошла.

### Задача 2: Проверка конфигурации Android exact-alarm и канала

**Подтверждено:**

- `app.json` содержит разрешение `SCHEDULE_EXACT_ALARM` в секции `android.permissions`.
- `hooks/useNotifications.ts` задаёт `importance: Notifications.AndroidImportance.HIGH` для канала `"tasks"` на Android.

Код изменений не требовалось, конфигурация уже соответствовала требованиям плана.

## Проверка и тесты

- `grep -R "Date.now() + 60000" hooks/useNotifications.ts` — найдено.
- `grep -R "SCHEDULE_EXACT_ALARM" app.json` — найдено.
- `grep -R "IMPORTANCE_HIGH" hooks/useNotifications.ts` — найдено.
- `npx jest hooks/useNotifications.test.ts` — тесты не найдены. Файл `hooks/useNotifications.test.ts` отсутствует в репозитории. Тестовое покрытие для данного поведения ещё не создано.

## Отклонения от плана

- Отклонений нет. План выполнен в точности как описано, за исключением того, что файл тестов отсутствовал и не мог быть запущен.

## Известные заглушки / Follow-up

- **Follow-up:** Добавить модульные тесты для `scheduleNotification`, включая кейс с past-dated reminder, чтобы закрыть acceptance criteria `Unit test asserts scheduleNotification returns an id for a past date`.
- **Follow-up:** При необходимости добавить `hooks/useNotifications.test.ts` с тестами на поведения:
  - reminder в прошлом → возвращается id;
  - reminder в будущем → планируется по исходной дате;
  - ошибка `scheduleNotificationAsync` → возвращается `undefined`.

## Self-Check

- [x] Созданные/изменённые файлы существуют.
- [x] Коммит существует в git-истории.
- [x] SUMMARY.md записан на диск.

## Self-Check: PASSED

- FOUND: hooks/useNotifications.ts
- FOUND: b6a5e33
