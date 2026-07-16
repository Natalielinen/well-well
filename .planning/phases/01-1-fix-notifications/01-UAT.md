---
status: testing
phase: 01-1-fix-notifications
source: ["01-VERIFICATION.md"]
started: 2026-07-16T10:30:00+03:00
updated: 2026-07-16T10:30:00+03:00
---

## Current Test

number: 1
name: Повторяющаяся задача с reminder в прошлом доставляет уведомление
expected: |
  Уведомление запланировано на Date.now() + 60с, а не потеряно; в логах/UI нет молчаливого сбоя.
awaiting: user response

## Tests

### 1. Повторяющаяся задача с reminder в прошлом доставляет уведомление

expected: Уведомление запланировано на Date.now() + 60с, а не потеряно; в логах/UI нет молчаливого сбоя.
result: [pending]

### 2. Завершить повторяющуюся задачу и проверить повторное уведомление

expected: Старое уведомление отменяется и планируется новое на следующую дату; notificationId в хранилище обновлён.
result: [pending]

### 3. Сымитировать сбой планирования уведомления

expected: Пользователю показывается Alert с ошибкой, а не консольное сообщение.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
