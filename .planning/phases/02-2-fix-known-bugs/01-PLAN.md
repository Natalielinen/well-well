---
phase: 02-2-fix-known-bugs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - utils/time.ts
  - components/Todo/Todo.tsx
  - hooks/useNotifications.ts
autonomous: true
requirements:
  - BUGF-04
user_setup: []
must_haves:
  truths:
    - "D-01: общая логика парсинга времени выносится в плоский модуль utils/time.ts без React-зависимостей"
    - "D-02: parseTime поддерживает только формат HH:mm; при невалидном значении возвращает null (не бросает исключение, не делает fallback на текущее время)"
    - parseTime('HH:mm') возвращает Date с корректным временем
    - parseTime('invalid') возвращает null и не выбрасывает исключение
    - formatTime(Date) возвращает строку 'HH:mm'
    - В Todo.tsx нет вызова split(':') для времени
    - В useNotifications.ts нет дублирования парсинга времени
  artifacts:
    - utils/time.ts с parseTime и formatTime
    - parseTime(str: string): Date | null
    - formatTime(date: Date): string
  key_links:
    - Импорт parseTime/formatTime в Todo.tsx и useNotifications.ts
---

<objective>
Вынести дублирующуюся логику парсинга/форматирования времени из Todo.tsx и useNotifications.ts в общую утилиту utils/time.ts, заменить существующие вызовы, убрать ручной split(':').

Purpose: Устранить BUGF-04 и подготовить единую точку парсинга времени.
Output: Новый модуль utils/time.ts и мигрированные вызовы в двух потребителях.
</objective>

## Artifacts this phase produces

- `utils/time.ts` (новый файл)
- `parseTime(str: string): Date | null`
- `formatTime(date: Date): string`
- Миграция `Todo.tsx` на `parseTime`/`formatTime`
- Миграция `useNotifications.ts` на `formatTime`

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
@components/Todo/Todo.tsx
@hooks/useNotifications.ts
@types/todo.ts
@constants/todo.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Создать утилиту utils/time.ts</name>
  <files>utils/time.ts</files>
  <read_first>
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
    - @components/Todo/Todo.tsx
    - @hooks/useNotifications.ts
    - @types/todo.ts
    - @constants/todo.ts
  </read_first>
  <action>
    Создать плоский модуль utils/time.ts без React-зависимостей. Реализовать две чистые функции: parseTime(str: string): Date | null и formatTime(date: Date): string в формате HH:mm. При невалидном значении parseTime возвращает null, а не бросает исключение и не fallback-ит на текущее время. Использовать нативные JS-инструменты или date-fns; ключевое требование — поддержка строго формата HH:mm и отсутствие выброса исключений. Имена функций и сигнатуры должны точно совпадать с публичным API из D-03.
  </action>
  <verify>
    <automated>test "$(grep -c 'export function parseTime' utils/time.ts)" -ge 1 &amp;&amp; test "$(grep -c 'export function formatTime' utils/time.ts)" -ge 1 &amp;&amp; test "$(grep -c ': Date | null' utils/time.ts)" -ge 1</automated>
  </verify>
  <acceptance_criteria>
    - В utils/time.ts объявлены ровно две экспортируемые функции: parseTime(str: string): Date | null и formatTime(date: Date): string.
    - formatTime(new Date(2026, 0, 1, 9, 5)) возвращает строку 09:05.
    - parseTime('14:30') возвращает Date с часами 14 и минутами 30.
    - parseTime('invalid') возвращает null и не выбрасывает исключение.
  </acceptance_criteria>
  <done>Файл utils/time.ts создан, экспортирует parseTime(str: string): Date | null и formatTime(date: Date): string, формат HH:mm, невалидный ввод возвращает null без исключения.</done>
</task>

<task type="auto">
  <name>Task 2: Мигрировать Todo.tsx на utils/time.ts</name>
  <files>components/Todo/Todo.tsx</files>
  <read_first>
    - @utils/time.ts
    - @components/Todo/Todo.tsx
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
  </read_first>
  <action>
    Заменить ручной парсинг времени в getUpdatedTime на вызовы parseTime и formatTime из utils/time.ts per D-03. getUpdatedTime остаётся в Todo.tsx как локальная единица, он не переносится в utils/time.ts. Сохранить поведение: getUpdatedTime(nextDate, reminderTime) вычисляет итоговую дату с временем из reminderTime в формате HH:mm. Обновить все внутренние вызовы внутри Todo.tsx на новую реализацию. Никаких split(':') для времени в этом файле быть не должно.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' components/Todo/Todo.tsx | grep -c "split(':')")" = "0"</automated>
  </verify>
  <acceptance_criteria>
    - В Todo.tsx импортированы parseTime и formatTime из utils/time.ts.
    - Функция getUpdatedTime больше не содержит split(':').
    - Поведение при валидном reminderTime='14:30' остаётся: итоговое время у даты установлено в 14:30.
  </acceptance_criteria>
  <done>Todo.tsx использует общую утилиту времени, дублирующий парсинг времени через split(':') устранён.</done>
</task>

<task type="auto">
  <name>Task 3: Мигрировать useNotifications.ts на utils/time.ts</name>
  <files>hooks/useNotifications.ts</files>
  <read_first>
    - @utils/time.ts
    - @hooks/useNotifications.ts
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
  </read_first>
  <action>
    В useNotifications.ts заменить дублирующуюся логику форматирования времени на formatTime из utils/time.ts. В текущем коде есть форматирование через format(new Date(todo.reminderDate), 'HH:mm') и похожие операции — заменить их на formatTime. Не добавлять React-зависимости в utils/time.ts. Убедиться, что после изменений поведение форматирования времени остаётся идентичным.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' hooks/useNotifications.ts | grep -c "formatTime")" -ge 1</automated>
  </verify>
  <acceptance_criteria>
    - В useNotifications.ts импортирован formatTime из utils/time.ts.
    - Все форматирования времени в HH:mm выполнены через formatTime, а не через format(..., 'HH:mm') или split(':').
    - Поведение rescheduleNextNotification не изменилось: reminder выводится в том же визуальном формате.
  </acceptance_criteria>
  <done>Дублирование парсинга/форматирования времени в useNotifications.ts устранено, используется utils/time.ts.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| utils/time.ts → потребители | Новая утилита будет использоваться в UI и хуках уведомлений |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-02-01 | Tampering | utils/time.ts | low | accept | Формат времени строго HH:mm, нет внешних входов кроме строки |
| T-02-SC | Tampering | npm/pip/cargo installs | high | mitigate | slopcheck + blocking human checkpoint for [ASSUMED]/[SUS] |
</threat_model>

<verification>
- [ ] utils/time.ts проходит ручную проверку форматов
- [ ] Todo.tsx и useNotifications.ts компилируются без ошибок
- [ ] grep подтверждает отсутствие split(':') в обоих потребителях
</verification>

<success_criteria>
Устранено дублирование парсинга времени, создана единая утилита, все вызовы мигрированы.
</success_criteria>

<output>
Создать `.planning/phases/02-2-fix-known-bugs/01-SUMMARY.md` после выполнения
</output>
