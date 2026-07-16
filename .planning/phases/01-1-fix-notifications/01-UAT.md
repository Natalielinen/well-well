---
status: testing
phase: 01-1-fix-notifications
source: ["01-VERIFICATION.md"]
started: 2026-07-16T10:30:00+03:00
updated: 2026-07-16T12:05:00+03:00
---

## Current Test

number: 1
name: Повторяющаяся задача с reminder в прошлом доставляет уведомление
expected: |
  Уведомление запланировано на Date.now() + 60с, а не потеряно; в логах/UI нет молчаливого сбоя.
awaiting: user response

## Tests

### 1. Повторяющаящаяся задача с reminder в прошлом доставляет уведомление

expected: Уведомление запланировано на Date.now() + 60с, а не потеряно; в логах/UI нет молчаливого сбоя.
result: issue
reported: "не совпадает, задача создалась с уведомлением в прошлом"
severity: major

### 2. Завершить повторяющуюся задачу и проверить повторное уведомление

expected: Старое уведомление отменяется и планируется новое на следующую дату; notificationId в хранилище обновлён.
result: pass

### 3. Сымитировать сбой планирования уведомления

expected: Пользователю показывается Alert с ошибкой, а не консольное сообщение.
result: skipped
reason: Не получилось имитировать сбой, пропускаем эту проверку.

## Summary

total: 3
passed: 1
issues: 1
pending: 0
skipped: 1
blocked: 0

## Gaps

- gap_id: G-1-1
  truth: "При создании задачи с reminder в прошлом уведомление должно быть перенесено на Date.now() + 60с, задача сохраняется и модал закрывается"
  status: resolved
  resolved_by: 04-PLAN.md
  resolved_at: 2026-07-16
  reason: "User reported: При создании задачи с уведомлением в прошлом, кнопка сохранить активна, но при нажатии ничего не происходит. Задача не сохраняется, окно создания не закрывается, сообщений в UI об ошибке нет."
  severity: major
  test: 1
  root_cause: "В AddTodo.tsx функция onCreate (строки 176-179) содержит блокирующую валидацию: при remindDate в прошлом выполняется early return с setError(minDate), поэтому onAddTodo/onUpdateTodo и onModalClose никогда не вызываются. Ошибка не рендерится в JSX, поэтому пользователь не видит сообщения. Кнопка «Сохранить» активна, потому что disabled зависит только от title. Корректный перенос даты уже реализован в scheduleNotification (useNotifications.ts:25-27), но он недостижим из-за early return."
  artifacts:
    - path: "components/AddTodo/AddTodo.tsx"
      issue: "Блокирующая валидация isBefore(remindDate, new Date()) с early return в onCreate (lines 176-179)"
    - path: "components/AddTodo/AddTodo.tsx"
      issue: "Ошибки error.minDate/error.title/error.repeatFrequency нигде не рендерятся в JSX"
    - path: "hooks/useNotifications.ts"
      issue: "scheduleNotification уже содержит правильный перенос на Date.now() + 60000 (lines 25-27), но недостижим из-за валидации выше по стеку"
  missing:
    - "Удалить или заменить на soft-warning блокирующую валидацию isBefore в onCreate (AddTodo.tsx:176-179)"
    - "Опционально: отображать error.minDate/error.title/error.repeatFrequency в JSX, если валидация нужна для других случаев"
  debug_session: ".planning/debug/past-reminder-notification-fails.md"

- gap_id: G-1-4
  truth: "При создании задачи с reminder в прошлом уведомление должно быть перенесено на Date.now() + 60с"
  status: failed
  reason: "User reported: не совпадает, задача создалась с уведомлением в прошлом"
  severity: major
  test: 1
  root_cause: "В scheduleNotification (useNotifications.ts:25-27) перенос на Date.now() + 60000 применяется только к локальной переменной date, которая используется для триггера OS-уведомления. Функция возвращает только notification id и не возвращает скорректированную дату. В App.tsx:145-160 onAddTodo сохраняет taskToSave с исходным прошедшим reminderDate, поэтому в хранилище и UI (Todo.tsx:223-232) продолжает отображаться прошедшая дата."
  artifacts:
    - path: "hooks/useNotifications.ts"
      issue: "scheduleNotification переносит дату только локально (lines 25-27) и не возвращает её; notificationId возвращается без adjusted date"
    - path: "App.tsx"
      issue: "onAddTodo/onUpdateTodo сохраняют исходный прошедший reminderDate в taskToSave, игнорируя скорректированную дату"
    - path: "components/Todo/Todo.tsx"
      issue: "Рендерит todo.reminderDate напрямую (lines 223-232), поэтому пользователь видит прошедшую дату"
    - path: "components/AddTodo/AddTodo.tsx"
      issue: "Записывает сырую прошедшую remindDate в форму (line 187) без нормализации"
  missing:
    - "Сделать нормализацию 'past → now+60s' авторитетной и сохранять скорректированную дату в taskToSave.reminderDate в App.tsx"
    - "Вернуть adjusted date из scheduleNotification или вычислить её в shared helper и записывать обратно в хранилище"
    - "Обновить rescheduleNextNotification в useNotifications.ts, чтобы он тоже сохранял скорректированную дату"
  debug_session: ".planning/debug/notification-not-rescheduled.md"
