# Phase 2: 2-fix-known-bugs - Context

**Gathered:** 2026-07-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 устраняет известные баги и типобезопасные уязвимости: BUGF-01 (тип `event: any` в `AddTodo.tsx`), BUGF-02 (показ ошибок пользователю в storage/notifications), BUGF-03 (runtime-валидация `Size`/`repeatFrequency`), BUGF-04 (вынос дублирующегося парсинга времени в общую утилиту). Границы фиксированы ROADMAP.md и REQUIREMENTS.md — новые возможности (рефакторинг App.tsx, тесты) относятся к Phase 3/4.

</domain>

<decisions>
## Implementation Decisions

### Общая утилита времени (BUGF-04)
- **D-01:** Общая логика парсинга времени выносится в плоский модуль `utils/time.ts` (без React-зависимостей), а не в `constants/todo.ts` или хук.
- **D-02:** Утилита поддерживает только формат `HH:mm` (как текущий `split(':')`). При невалидном значении `parseTime` возвращает `null` (согласно сигнатуре `Date | null` из D-03) — не бросает исключение и не делает fallback на текущее время.
- **D-03:** Публичный API модуля — две чистые функции: `parseTime(str: string): Date | null` и `formatTime(date: Date): string` (формат `HH:mm`). Существующие вызовы из `Todo.tsx` (getUpdatedTime) и `useNotifications.ts` заменяются на них; `getUpdatedTime` как именованная единица не переносится.

### the agent's Discretion
- BUGF-01: заменить `event: any` на корректный тип (например, `NativeSyntheticEvent<TextInputChangeEvent>` или соответствующий обработчику) — решение за агентом в рамках типобезопасности.
- BUGF-02: способ показа ошибок пользователю (Alert / inline-баннер / toast) и форма обёртки (единый хелпер vs точечные вызовы) — на усмотрение агента, но ошибки НЕ должны теряться молча (контракт из success criteria).
- BUGF-03: точка применения валидации (`Size`, `repeatFrequency`) и стратегия fail-closed vs приведение к значению по умолчанию — на усмотрение агента; требуется runtime-проверка критичных полей.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Проблемы и долг
- `.planning/codebase/CONCERNS.md` — разделы «Дублирование логики обновления reminder» (№3), «Обработка ошибок через console.log» (№4), «Отсутствие валидации на уровне типа» (№5), «Известные баги» (event: any в AddTodo.tsx:108).
- `.planning/ROADMAP.md` § Phase 2 — Goal, Context, Success criteria (нет `any` в обработчиках, ошибки показываются, runtime-валидация, логика времени в общей утилите).
- `.planning/REQUIREMENTS.md` § Bugfixes — BUGF-01..BUGF-04 (точные критерии приёмки).

### Исходный код (точки правок)
- `components/AddTodo/AddTodo.tsx` — `event: any` (~строка 108).
- `storage/todoStorage.ts` — ошибки только логируются (строки 10, 20).
- `hooks/useNotifications.ts` — `console.error` (строка 105); дублирующийся парсинг времени.
- `components/Todo/Todo.tsx` — `getUpdatedTime` (строки 35-41) парсит время через `split(':')`.
- `types/todo.ts` — доменные типы `Size` (`1 | 3 | 5 | 8 | 13`), `TodoItem`, `repeatFrequency`.
- `constants/todo.ts` — константы размеров (`sizes`, `sizeOptions`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `types/todo.ts` — уже содержит `Size` как union-литерал; валидация может опираться на этот тип.
- `constants/todo.ts` — существующие справочники значений; новая утилита времени не дублирует их.
- `date-fns` — уже в зависимостях проекта (по PROJECT.md); можно использовать для форматирования/парсинга, но решено ограничиться `HH:mm`.

### Established Patterns
- Утилиты/хранилище именуются `camelCase.ts` (например, `todoStorage.ts`) — `utils/time.ts` согласуется с этим.
- Ошибки сейчас «глушатся» через `console.log/error`; новый подход должен ломать эту привычку.

### Integration Points
- `Todo.tsx` и `useNotifications.ts` оба вызывают логику времени — после выноса в `utils/time.ts` оба импортируют из него.
- `AddTodo.tsx` — точка типобезопасности обработчика ввода.
- `todoStorage.ts` — точка показа ошибок при чтении/записи AsyncStorage.

</code_context>

<specifics>
## Specific Ideas

- Утилита времени: чистые функции `parseTime`/`formatTime`, формат строго `HH:mm`, ошибка парсинга → текущее время (не исключение).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 2-2-fix-known-bugs*
*Context gathered: 2026-07-17*
