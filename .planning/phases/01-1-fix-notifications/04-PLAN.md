---
phase: "01"
plan: "04"
type: execute
wave: 4
depends_on: []
gap_closure: true
gap_ids: [G-1-1]
files_modified:
  - components/AddTodo/AddTodo.tsx
autonomous: true
requirements: [NOTF-01]
must_haves:
  truths:
    - G-1-1: При создании задачи с reminder в прошлом уведомление планируется на Date.now() + 60000 (логика в scheduleNotification достижима и срабатывает)
    - G-1-1: задача сохраняется (вызывается onAddTodo/onUpdateTodo) при нажатии «Сохранить» даже если remindDate в прошлом
    - G-1-1: модал закрывается (вызывается onModalClose) после сохранения с прошедшим reminder
    - G-1-1: блокирующий early return по isBefore(remindDate, new Date()) в onCreate отсутствует
  prohibitions:
    - НЕТ блокирующей валидации isBefore(remindDate, new Date()) с early return в onCreate
    - НЕТ молчаливого сбоя (задача не сохраняется, модал не закрывается) при прошедшем reminder
    - НЕ удалять корректный перенос даты в scheduleNotification (useNotifications.ts:25-27)
---

<objective>
Устранить блокирующую валидацию в `components/AddTodo/AddTodo.tsx` (onCreate, строки 176-179), которая при прошедшем reminder выполняет early return и тем самым никогда не вызывает `onAddTodo`/`onUpdateTodo` и `onModalClose`. После удаления этой валидации управление прошедшей датой делегируется в `scheduleNotification` (useNotifications.ts:25-27), который уже корректно сдвигает дату на `Date.now() + 60000`.

Purpose: Закрыть gap G-1-1 — задача должна сохраняться, модал закрываться, а уведомление доставляться не позднее 60с после запланированного прошедшего времени.

Output: Изменённый файл `components/AddTodo/AddTodo.tsx` без блокирующего early return по remindDate.
</objective>

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@D:/myProjects/Android/wellWell/.planning/phases/01-1-fix-notifications/01-UAT.md
@D:/myProjects/Android/wellWell/components/AddTodo/AddTodo.tsx
@D:/myProjects/Android/wellWell/hooks/useNotifications.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Удалить блокирующую валидацию прошедшего reminder из onCreate</name>
  <files>components/AddTodo/AddTodo.tsx</files>
  <action>В функции onCreate (AddTodo.tsx) удалить блок валидации на строках 176-179:
    ```
    if (showRemindField && remindDate && isBefore(remindDate, new Date())) {
        setError({ ...error, minDate: "Время напоминания не может быть в прошлом" });
        return;
    }
    ```
    Не заменять на soft-warning для данного условия — gap требует, чтобы при прошедшем reminder поток шёл дальше к сохранению задачи и вызову onModalClose. Запретить добавление любого early return по условию isBefore(remindDate, new Date()) в этой функции.
    Остальные валидации (пустой title — строки 152-158, пустая repeatFrequency — строки 160-166, прошедшая nextDate — строки 168-174) оставить без изменений, но проверить, что они корректно рендерятся пользователю (см. Task 2).
    Не изменять import isBefore — он всё ещё используется для валидации nextDate (строка 168).
    НЕ изменять hooks/useNotifications.ts: логика переноса даты date = new Date(Date.now() + 60000) на строках 25-27 должна остаться и стать достижимой из onCreate через вызов планирования уведомления в родительском компоненте (App.tsx), который использует scheduleNotification.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | findstr /i "AddTodo" || echo OK_NO_ADDTODO_ERRORS</automated>
  </verify>
  <done>Блока early return по isBefore(remindDate, new Date()) в onCreate больше нет; сборка TypeScript проходит без ошибок в AddTodo.</done>
</task>

<task type="auto">
  <name>Task 2: Отобразить ошибки валидации (error.minDate/error.title/error.repeatFrequency) в JSX</name>
  <files>components/AddTodo/AddTodo.tsx</files>
  <action>В JSX-разметке (внутри блока &lt;View style={styles.form}&gt;, до блока actions) добавить рендеринг сообщений валидации, чтобы пользователь видел ошибки, которые устанавливаются в onCreate для title/repeatFrequency/minDate (прошедшая дата выполнения). Примерная логика — для каждого непустого поля error выводить &lt;Text style={styles.errorText}&gt;{error.field}&lt;/Text&gt;. Это опциональная часть gap, но необходима, чтобы оставшиеся блокирующие валидации (title, repeatFrequency, nextDate) не были «молчаливыми» для пользователя.
    Не создавать новых ранних выходов по remindDate. Если в themes/styles.ts отсутствует errorText, добавить минимальное определение (цвет из colors.error или colors.textError красный, размер шрифта меньше label).
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | findstr /i "AddTodo" || echo OK_NO_ADDTODO_ERRORS</automated>
  </verify>
  <done>В JSX присутствует вывод error.title/error.repeatFrequency/error.minDate; сборка TypeScript проходит без ошибок. Проверить grep: в файле AddTodo.tsx есть обращение к error.minDate/error.title/error.repeatFrequency в JSX-части (не только в setState).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| пользователь→модал AddTodo | пользователь вводит title/reminder, валидируется на клиенте |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-01-SC | Tampering | npm/pip/cargo installs | low | accept | изменения только в исходном коде, без установки пакетов |
</threat_model>

<verification>
После применения плана:
1. `npx tsc --noEmit` — без ошибок в AddTodo.tsx.
2. Ручная проверка (gap G-1-1, тест 1): открыть модал добавления дела, включить «Напомнить?», выбрать время в прошлом, нажать «Сохранить» → задача сохраняется, модал закрывается, уведомление планируется на Date.now() + 60000 (подтверждается логикой scheduleNotification, строки 25-27, которая теперь достижима).
</verification>

<success_criteria>
- Gap G-1-1 закрыт: при прошедшем reminder задача сохраняется, модал закрывается, уведомление переносится на Date.now() + 60000.
- В onCreate отсутствует любой early return по isBefore(remindDate, new Date()).
- Логика переноса даты в useNotifications.ts (строки 25-27) сохранена и достижима.
- Ошибки валидации title/repeatFrequency/minDate отображаются в JSX.
</success_criteria>

<output>
Create `.planning/phases/01-1-fix-notifications/04-SUMMARY.md` when done
</output>
