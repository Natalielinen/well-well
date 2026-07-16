---
phase: "01"
plan: "05"
type: execute
wave: 1
depends_on: []
files_modified:
  - hooks/useNotifications.ts
  - App.tsx
  - components/Todo/Todo.tsx
gap_closure: true
gap_ids: [G-1-4]
requirements: [NOTF-01, NOTF-02]
autonomous: true
must_haves:
  truths:
    - G-1-4: При создании или редактировании задачи с reminder в прошлом хранилище и UI отражают adjusted reminderDate = Date.now() + 60000, а не исходную прошедшую дату
    - G-1-4: scheduleNotification возвращает adjustedDate вместе с notificationId
    - G-1-4: rescheduleNextNotification возвращает adjustedDate и persistence обновляет reminderDate в задаче
    - G-1-4: При завершении повторяющейся задачи reminderDate обновляется до rescheduled времени
  prohibitions:
    - НЕТ сохранения исходного прошедшего reminderDate в taskToSave без нормализации
    - НЕТ локального изменения date в scheduleNotification без возврата adjustedDate наружу
    - НЕТ модификации AddTodo.tsx (нормализация authoritative в App.tsx, форма уже прошла проверку в G-1-1)
---

<objective>
Сделать нормализацию `past → now+60s` authoritative и persisted: вычислить effective reminder date во время scheduling, вернуть его из `scheduleNotification` и `rescheduleNextNotification`, и записать adjusted date обратно в хранилище через `App.tsx` и `Todo.tsx`, чтобы хранилище и UI отражали rescheduled время.

Purpose: Закрыть gap G-1-4 — задача с reminder в прошлом должна сохраняться с перенесённой датой, а UI должен показывать скорректированное время, а не исходное прошедшее.

Output: Изменённые `hooks/useNotifications.ts`, `App.tsx`, `components/Todo/Todo.tsx` с authoritative normalization и persisted adjusted date.
</objective>

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@D:/myProjects/Android/wellWell/.planning/phases/01-1-fix-notifications/01-UAT.md
@D:/myProjects/Android/wellWell/hooks/useNotifications.ts
@D:/myProjects/Android/wellWell/App.tsx
@D:/myProjects/Android/wellWell/components/Todo/Todo.tsx
@D:/myProjects/Android/wellWell/types/todo.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Authoritative normalization в useNotifications.ts и persistence в App.tsx</name>
  <files>hooks/useNotifications.ts, App.tsx</files>
  <action>
    В `hooks/useNotifications.ts`:
    - Добавить вспомогательную функцию `getEffectiveReminderDate(date: Date): Date`, которая возвращает `new Date(Date.now() + 60000)`, если `date <= new Date()`, иначе возвращает исходную дату без изменений. Это устраняет дублирование логики между `scheduleNotification` и `rescheduleNextNotification`.
    - Изменить сигнатуру `scheduleNotification` с `Promise<string | undefined>` на `Promise<{notificationId: string | undefined; adjustedDate: Date}>`. Внутри функции использовать `getEffectiveReminderDate` для нормализации даты перед вызовом `Notifications.scheduleNotificationAsync`. Возвращать объект с фактически использованным `adjustedDate`.
    
    В `App.tsx`:
    - Обновить `onAddTodo` (строки 142-162): деструктуризировать результат `scheduleNotification` на `notificationId` и `adjustedDate`. При наличии `adjustedDate` записывать `taskToSave.reminderDate = adjustedDate.toISOString()`. То же самое проделать в `onUpdateTodo` (строки 164-191).
    - Убедиться, что `taskToSave` сохраняет скорректированную дату, а не исходную.
    
    Ссылка на gap: G-1-4 missing items — authoritative normalization и запись adjusted date в App.tsx.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
    <automated>grep -c "getEffectiveReminderDate" hooks/useNotifications.ts | findstr /v "0" >nul && (echo OK_HELPER_EXISTS) || (echo FAIL_HELPER_MISSING &amp; exit /b 1)</automated>
    <automated>grep -c "adjustedDate" App.tsx | findstr /v "0" >nul && (echo OK_ADJUSTED_DATE_USED_IN_APP) || (echo FAIL_ADJUSTED_DATE_NOT_USED &amp; exit /b 1)</automated>
  </verify>
  <done>TypeScript собирается без ошибок; в `useNotifications.ts` есть `getEffectiveReminderDate`; `scheduleNotification` возвращает `adjustedDate`; `onAddTodo` и `onUpdateTodo` записывают `adjustedDate.toISOString()` в `taskToSave.reminderDate`.</done>
</task>

<task type="auto">
  <name>Task 2: Persist adjusted date в reschedule path и Todo.tsx</name>
  <files>hooks/useNotifications.ts, components/Todo/Todo.tsx</files>
  <action>
    В `hooks/useNotifications.ts`:
    - Изменить сигнатуру `rescheduleNextNotification` на `Promise<{notificationId: string | undefined; adjustedDate: Date | undefined}>`. Использовать `getEffectiveReminderDate` для нормализации `nextDate`, если она оказывается в прошлом. Возвращать объект с обоими значениями.
    
    В `components/Todo/Todo.tsx`:
    - Обновить `handleCompleteTask` (строки 44-51): деструктуризировать результат `rescheduleNextNotification` на `notificationId` и `adjustedDate`. Если `adjustedDate` определён, добавлять его в объект, передаваемый в `updateTodo`, как `reminderDate: adjustedDate.toISOString()`.
    - Убедиться, что `notificationId` продолжает корректно обновляться.
    
    Ссылка на gap: G-1-4 missing item — обновить `rescheduleNextNotification`, чтобы он сохранял скорректированную дату.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
    <automated>grep -c "adjustedDate" components/Todo/Todo.tsx | findstr /v "0" >nul && (echo OK_ADJUSTED_DATE_USED_IN_TODO) || (echo FAIL_ADJUSTED_DATE_NOT_USED &amp; exit /b 1)</automated>
  </verify>
  <done>TypeScript собирается без ошибок; `rescheduleNextNotification` возвращает `adjustedDate`; `handleCompleteTask` в `Todo.tsx` записывает `adjustedDate.toISOString()` в `updateTodo` при наличии скорректированной даты.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| App.tsx → useNotifications.ts | Внутренний вызов scheduling, пользовательский reminderDate пересекает границу компонента и хука |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-01-05 | Tampering | hooks/useNotifications.ts getEffectiveReminderDate | medium | mitigate | Явная helper-функция с единой точкой нормализации; TypeScript-тип гарантирует возврат Date; grep-верификация на месте |
| T-02-05 | Information disclosure | App.tsx / Todo.tsx error handling | low | accept | Ошибки scheduling уже обрабатываются через Alert.alert в scheduleNotification; новые изменения не добавляют sensitive data в логи |
| T-SC-05 | Tampering | npm installs | low | accept | Планирование без установки новых пакетов; изменения только в исходном коде |
</threat_model>

<verification>
После применения плана:
1. `npx tsc --noEmit` — без ошибок в `useNotifications.ts`, `App.tsx`, `Todo.tsx`.
2. Создать задачу с reminder в прошлом → задача сохраняется, в хранилище и UI отображается время `Date.now() + 60с`, а не исходное прошедшее.
3. Завершить повторяющуюся задачу с reminder → в хранилище `reminderDate` обновляется до rescheduled времени следующего выполнения.
</verification>

<success_criteria>
- Gap G-1-4 закрыт: при создании/редактировании/завершении задачи с reminder в прошлом хранилище и UI отражают `Date.now() + 60000`.
- `scheduleNotification` и `rescheduleNextNotification` возвращают `adjustedDate` вместе с `notificationId`.
- Нет сохранения исходного прошедшего `reminderDate` в хранилище без нормализации.
- Нет модификаций в `AddTodo.tsx`.
</success_criteria>

<output>
Create `.planning/phases/01-1-fix-notifications/05-SUMMARY.md` when done
</output>
