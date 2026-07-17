---
phase: 02-2-fix-known-bugs
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - components/AddTodo/AddTodo.tsx
autonomous: true
requirements:
  - BUGF-01
user_setup: []
must_haves:
  truths:
    - В AddTodo.tsx нет обработчиков с типом any
    - onChange у DateTimePicker имеет корректный тип из React Native
  artifacts:
    - components/AddTodo/AddTodo.tsx с типизированными обработчиками
  key_links:
    - Импорт типов события из react-native
---

<objective>
Устранить типобезопасность event: any в обработчиках DateTimePicker в AddTodo.tsx.

Purpose: Устранить BUGF-01 и повысить типобезопасность обработчиков событий.
Output: AddTodo.tsx без any в параметрах обработчиков onChange.
</objective>

## Artifacts this phase produces

- Типизированные обработчики `onNextDateChange`, `onRemindDateChange`, `onRemindTimeChange` в `components/AddTodo/AddTodo.tsx`
- Устранение `event: any` из обработчиков `DateTimePicker`

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
@components/AddTodo/AddTodo.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Типизировать обработчики DateTimePicker в AddTodo</name>
  <files>components/AddTodo/AddTodo.tsx</files>
  <read_first>
    - @components/AddTodo/AddTodo.tsx
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
  </read_first>
  <action>
    Заменить типы event: any в onNextDateChange, onRemindDateChange, onRemindTimeChange на корректные типы обработчиков DateTimePicker из @react-native-community/datetimepicker. Использовать тип события, соответствующий режиму и платформе; например, для onChange DateTimePicker это NativeSyntheticEvent<DateTimePickerEvent> или аналогичный тип из пакета. Не изменять сигнатуры компонентов и не добавлять лишних абстракций. Должен остаться доступ к selectedDate через вторые параметры.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' components/AddTodo/AddTodo.tsx | grep -c "event: any")" = "0"</automated>
  </verify>
  <acceptance_criteria>
    - В AddTodo.tsx нет токена any в типах параметров.
    - Обработчики onNextDateChange, onRemindDateChange, onRemindTimeChange используют типы из @react-native-community/datetimepicker или react-native.
    - TypeScript компилируется без ошибок типов в этом файле.
  </acceptance_criteria>
  <done>Все обработчики событий в AddTodo.tsx типизированы, event: any устранён.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| AddTodo.tsx обработчики | Ввод пользователя через DateTimePicker |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-02-02 | Tampering | AddTodo.tsx | medium | mitigate | Строгая типизация обработчиков, отказ от any |
| T-02-SC | Tampering | npm/pip/cargo installs | high | mitigate | slopcheck + blocking human checkpoint for [ASSUMED]/[SUS] |
</threat_model>

<verification>
- [ ] TypeScript компилирует AddTodo.tsx без ошибок
- [ ] grep подтверждает отсутствие any в параметрах обработчиков
</verification>

<success_criteria>
Нет any в обработчиках событий AddTodo.tsx.
</success_criteria>

<output>
Создать `.planning/phases/02-2-fix-known-bugs/02-SUMMARY.md` после выполнения
</output>
