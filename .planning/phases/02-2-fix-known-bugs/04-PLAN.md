---
phase: 02-2-fix-known-bugs
plan: 04
type: execute
wave: 2
depends_on:
  - "02"
files_modified:
  - types/todo.ts
  - constants/todo.ts
  - components/AddTodo/AddTodo.tsx
autonomous: true
requirements:
  - BUGF-03
user_setup: []
must_haves:
  truths:
    - Size валидируется как 1|3|5|8|13
    - repeatFrequency валидируется как положительное целое
    - Невалидные значения отклоняются на этапе создания/обновления задачи
  artifacts:
    - Валидация Size и repeatFrequency в AddTodo.tsx
    - Валидаторы в types/todo.ts или constants/todo.ts
  key_links:
    - Создание задачи через AddTodo.tsx
---

<objective>
Добавить runtime-валидацию критичных полей Size и repeatFrequency, чтобы некорректные значения не попадали в хранилище.

Purpose: Устранить BUGF-03 и исключить запись невалидных значений в AsyncStorage.
Output: Валидаторы на TypeScript-уровне и runtime-проверка при создании задачи.
</objective>

## Artifacts this phase produces

- `isValidSize(value: number): value is Size` в `types/todo.ts` или `constants/todo.ts`
- `isValidRepeatFrequency(value: number): boolean` в `types/todo.ts` или `constants/todo.ts`
- Runtime-валидация в `components/AddTodo/AddTodo.tsx`

<execution_context>
@D:/myProjects/Android/wellWell/.kilo/gsd-core/workflows/execute-plan.md
@D:/myProjects/Android/wellWell/.kilo/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
@types/todo.ts
@constants/todo.ts
@components/AddTodo/AddTodo.tsx
</context>

<note>
Этот план модифицирует `components/AddTodo/AddTodo.tsx` после изменений Plan 02 (типизация обработчиков). Выполнение должно быть последовательным (не параллельным) относительно Plan 02 из-за пересечения по этому файлу.
</note>

<tasks>

<task type="auto">
  <name>Task 1: Добавить валидатор Size и repeatFrequency</name>
  <files>
    - types/todo.ts
    - constants/todo.ts
  </files>
  <read_first>
    - @types/todo.ts
    - @constants/todo.ts
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
  </read_first>
  <action>
    Добавить в types/todo.ts или constants/todo.ts функцию валидации isValidSize(value: number): value is Size и isValidRepeatFrequency(value: number): boolean. Использовать существующий union-тип Size из types/todo.ts и массив sizeOptions из constants/todo.ts. Не изменять существующие экспорты, только добавить новые. Стратегия fail-closed: невалидные значения отклоняются на этапе ввода, значение по умолчанию не подставляется автоматически.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' types/todo.ts constants/todo.ts | grep -c "isValid")" -ge 2</automated>
  </verify>
  <acceptance_criteria>
    - В types/todo.ts или constants/todo.ts объявлены функции валидации isValidSize и isValidRepeatFrequency.
    - isValidSize(5) возвращает true, isValidSize(2) возвращает false.
    - isValidRepeatFrequency(0) возвращает false, isValidRepeatFrequency(-1) возвращает false, isValidRepeatFrequency(1) возвращает true.
  </acceptance_criteria>
  <done>Валидаторы Size и repeatFrequency добавлены и экспортируются.</done>
</task>

<task type="auto">
  <name>Task 2: Применить валидацию в AddTodo.tsx</name>
  <files>components/AddTodo/AddTodo.tsx</files>
  <read_first>
    - @components/AddTodo/AddTodo.tsx
    - @types/todo.ts
    - @constants/todo.ts
    - @.planning/phases/02-2-fix-known-bugs/02-CONTEXT.md
  </read_first>
  <action>
    В AddTodo.tsx применить валидацию isValidSize и isValidRepeatFrequency перед созданием задачи. Если repeatFrequency не проходит валидацию — показать ошибку в состоянии error.repeatFrequency. Если size не проходит валидацию — привести к первому значению из sizeOptions или показать ошибку; согласно discretion, стратегия fail-closed: отклонять невалидный ввод и не давать сохранить задачу. Не изменять логику других полей.
  </action>
  <verify>
    <automated>test "$(grep -v '^#' components/AddTodo/AddTodo.tsx | grep -c "isValid")" -ge 2</automated>
  </verify>
  <acceptance_criteria>
    - В AddTodo.tsx импортированы isValidSize и isValidRepeatFrequency.
    - При repeatFrequency = -1 или 0 задача не сохраняется, появляется ошибка repeatFrequency.
    - При невалидном size задача не сохраняется или size корректируется на валидный; ошибка не теряется.
    - TypeScript компилируется без ошибок.
  </acceptance_criteria>
  <done>Runtime-валидация Size и repeatFrequency применена, невалидные значения не сохраняются.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| AddTodo.tsx → storage | Ввод пользователя перед записью в AsyncStorage |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-02-05 | Tampering | types/todo.ts | medium | mitigate | Валидация Size через whitelist значений 1|3|5|8|13 |
| T-02-06 | Tampering | components/AddTodo/AddTodo.tsx | medium | mitigate | Fail-closed валидация repeatFrequency: отклонять 0 и отрицательные значения |
| T-02-SC | Tampering | npm/pip/cargo installs | high | mitigate | slopcheck + blocking human checkpoint for [ASSUMED]/[SUS] |
</threat_model>

<verification>
- [ ] types/todo.ts/constants/todo.ts и AddTodo.tsx компилируются без ошибок
- [ ] grep подтверждает наличие вызовов isValidSize/isValidRepeatFrequency
- [ ] Поведение при невалидном вводе проверяется вручную или через тест
</verification>

<success_criteria>
Size и repeatFrequency валидируются runtime, невалидные значения не попадают в хранилище.
</success_criteria>

<output>
Создать `.planning/phases/02-2-fix-known-bugs/04-SUMMARY.md` после выполнения
</output>
