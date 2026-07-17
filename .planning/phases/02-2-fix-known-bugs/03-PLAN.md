---
phase: 02-2-fix-known-bugs
plan: 03
type: execute
wave: 2
depends_on:
  - "01"
files_modified:
  - storage/todoStorage.ts
  - hooks/useNotifications.ts
autonomous: true
requirements:
  - BUGF-02
user_setup: []
must_haves:
  truths:
    - Ошибки AsyncStorage пробрасываются наверх, а не глушатся
    - Ошибки планирования уведомлений пробрасываются наверх и видны пользователю
  artifacts:
    - storage/todoStorage.ts без console.log ошибок
    - hooks/useNotifications.ts без console.error для пользовательских ошибок
  key_links:
    - Обработка ошибок в вызывающих компонентах
---

<objective>
Обеспечить, чтобы ошибки хранилища и уведомлений не терялись молча и были видимы пользователю.

Purpose: Устранить BUGF-02 и исключить потерю ошибок при работе с AsyncStorage и expo-notifications.
Output: storage/todoStorage.ts и hooks/useNotifications.ts без молчаливого поглощения ошибок.
</objective>

## Artifacts this phase produces

- `saveTodos`/`loadTodos` в `storage/todoStorage.ts` выбрасывают ошибки наверх
- `scheduleNotification`/`rescheduleNextNotification` в `hooks/useNotifications.ts` выбрасывают ошибки наверх
- Устранение `Alert.alert` внутри хука уведомлений для пользовательских ошибок

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
@storage/todoStorage.ts
@hooks/useNotifications.ts
@.planning/codebase/CONCERNS.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Пробросить ошибки storage наружу</name>
  <files>storage/todoStorage.ts</files>
  <read_first>
    - @storage/todoStorage.ts
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
    - @.planning/codebase/CONCERNS.md
  </read_first>
  <action>
    В storage/todoStorage.ts заменить console.log в блоках catch на проброс ошибки наверх через throw. В saveTodos и loadTodos оставить типы без изменений, но вместо молчаливого поглощения ошибки выбрасывать её. Не добавлять Alert в storage; показ ошибок остаётся на ответственности вызывающего кода. Для loadTodos при ошибке возвращать пустой массив больше нельзя — вызывающий должен получить ошибку и решить, как сообщить пользователю.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' storage/todoStorage.ts | grep -c "console.log")" = "0"</automated>
  </verify>
  <acceptance_criteria>
    - В storage/todoStorage.ts нет строк console.log и console.error.
    - saveTodos и loadTodos выбрасывают ошибку при падении AsyncStorage.
    - Сигнатуры функций не изменились.
  </acceptance_criteria>
  <done>Ошибки storage не глушатся, пробрасываются наверх через throw.</done>
</task>

<task type="auto">
  <name>Task 2: Пробросить ошибки notifications наружу</name>
  <files>hooks/useNotifications.ts</files>
  <read_first>
    - @hooks/useNotifications.ts
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
    - @.planning/codebase/CONCERNS.md
  </read_first>
  <action>
    В hooks/useNotifications.ts заменить внутренний Alert.alert на строке 51 (возвращает undefined и создаёт silent failure) на проброс ошибки наверх через throw. В scheduleNotification и rescheduleNextNotification оставить сигнатуры, но при ошибке выбрасывать её. Не показывать Alert внутри хука; ответственность за пользовательское сообщение остаётся у вызывающего кода. getEffectiveReminderDate остаётся без изменений. grep console. не подтверждает удаление Alert.alert, это проверяется acceptance criteria.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' hooks/useNotifications.ts | grep -c "Alert.alert")" = "0"</automated>
  </verify>
  <acceptance_criteria>
    - В hooks/useNotifications.ts нет Alert.alert внутри scheduleNotification/rescheduleNextNotification.
    - При ошибке планирования уведомления выбрасывается исключение, а не показывается Alert или возвращается undefined.
    - Сигнатуры scheduleNotification и rescheduleNextNotification не изменились.
  </acceptance_criteria>
  <done>Ошибки notifications не глушатся и не показываются Alert внутри хука, пробрасываются наверх.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| storage/todoStorage.ts → UI | Ошибки чтения/записи данных должны доходить до пользователя |
| hooks/useNotifications.ts → UI | Ошибки планирования уведомлений должны доходить до пользователя |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-02-03 | Information Disclosure | storage/todoStorage.ts | medium | mitigate | Выбрасывать ошибку наверх вместо console.log, чтобы вызывающий код мог сообщить пользователю |
| T-02-04 | Denial of Service | hooks/useNotifications.ts | medium | mitigate | Проброс ошибки планирования наверх вместо скрытого Alert, чтобы можно было повторить действие |
| T-02-SC | Tampering | npm/pip/cargo installs | high | mitigate | slopcheck + blocking human checkpoint for [ASSUMED]/[SUS] |
</threat_model>

<verification>
- [ ] storage/todoStorage.ts и hooks/useNotifications.ts компилируются без ошибок
- [ ] grep подтверждает отсутствие console.log/console.error в обоих файлах
- [ ] Вызывающие компоненты могут обработать reject Promise
</verification>

<success_criteria>
Ошибки storage и notifications пробрасываются наверх и не теряются молча.
</success_criteria>

<output>
Создать `.planning/phases/02-2-fix-known-bugs/03-SUMMARY.md` после выполнения
</output>
