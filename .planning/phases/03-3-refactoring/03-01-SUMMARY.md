---
phase: 03-3-refactoring
plan: 01
subsystem: ui
tags: [react-native, hooks, date-fns, refactoring]

requires:
  - phase: 02-2-fix-known-bugs
    provides: "Прецедент чистого модуля утилит без React (utils/time.ts)"
provides:
  - "Чистый модуль utils/todoFilters.ts с предикатами дат и фильтрацией/сортировкой списка задач"
  - "Кастомный хук hooks/useTodoFilters.ts, инкапсулирующий вычисление displayedTodos"
  - "App.tsx без inline бизнес-логики предикатов дат/сортировки/фильтрации задач"
affects: [03-3-refactoring, 04-testing]

tech-stack:
  added: []
  patterns: ["Чистые функции без React в utils/ (прецедент utils/time.ts) + кастомные хуки в hooks/ (прецедент useNotifications.ts), которые их оборачивают в useMemo"]

key-files:
  created:
    - utils/todoFilters.ts
    - hooks/useTodoFilters.ts
  modified:
    - App.tsx

key-decisions:
  - "isExpired/isFuture принимают необязательный параметр now (по умолчанию new Date()) вместо прямого вызова startOfDay(new Date()) внутри — облегчает будущее unit-тестирование (Phase 4, TEST-01) без моков глобального времени"
  - "useTodoFilters возвращает не только displayedTodos, но и сами предикаты isExpired/isFuture — App.tsx использует их в renderItem вместо повторного импорта из utils/todoFilters.ts"

patterns-established:
  - "Чистая бизнес-логика (без React) выносится в utils/*.ts; кастомные хуки в hooks/*.ts оборачивают её в useMemo/useCallback и являются единственной точкой, откуда компоненты получают вычисленные данные"

requirements-completed: [REF-01]

coverage:
  - id: D1
    description: "utils/todoFilters.ts — чистый модуль без React-импортов, экспортирует isExpired, isToday, isFuture, sortByDate, filterDisplayedTodos"
    requirement: "REF-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -c '^export' utils/todoFilters.ts = 5; grep -c 'from \"react\"' utils/todoFilters.ts = 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "hooks/useTodoFilters.ts оборачивает filterDisplayedTodos в useMemo с зависимостями [allTodos, selectedDate, showAll]; App.tsx получает displayedTodos из хука вместо inline useMemo"
    requirement: "REF-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -c 'const displayedTodos' App.tsx = 0; hooks/useTodoFilters.ts импортирует filterDisplayedTodos из ../utils/todoFilters"
        status: pass
    human_judgment: false
  - id: D3
    description: "renderItem в App.tsx использует isExpired/isFuture из useTodoFilters; остаточные inline-определения isExpired/isToday/isFuture/sortByDate и неиспользуемые импорты date-fns/useMemo удалены из App.tsx"
    requirement: "REF-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -c 'const isExpired|const isToday|const isFuture|const sortByDate' App.tsx = 0 для каждого"
        status: pass
    human_judgment: false
  - id: D4
    description: "Поведение приложения не изменилось (behavior-preserving, D-06): состав и порядок списка задач (просроченные → сегодняшние, режим «Все задачи»), бейджи «Просрочена»/будущее идентичны версии до рефакторинга"
    verification:
      - kind: manual_procedural
        ref: "Ручная проверка в приложении (npm run android) после Task 1 (tracer-срез) — пользователь подтвердил (\"approved\") идентичность списка задач и бейджей до и после рефакторинга"
        status: pass
    human_judgment: true
    rationale: "Визуальная/функциональная эквивалентность UI на реальных данных не поддаётся автоматической проверке без renderHook/e2e-инфраструктуры (добавляется в Phase 4, TEST-01); подтверждено пользователем."

duration: 18min
completed: 2026-07-25
status: complete
---

# Phase 03: План 01 — Вынос фильтрации задач из App.tsx Summary

**Предикаты дат, сортировка и вычисление отображаемого списка задач вынесены из `App.tsx` в чистый модуль `utils/todoFilters.ts` и кастомный хук `hooks/useTodoFilters.ts`, без изменения наблюдаемого поведения**

## Performance

- **Duration:** 18 мин (между коммитами Task 1 и Task 2; между ними была пауза на ручную проверку пользователем tracer-среза)
- **Started:** 2026-07-25T10:34:44Z
- **Completed:** 2026-07-25T10:52:39Z
- **Tasks:** 2
- **Files modified:** 3 (2 создано, 1 изменён)

## Accomplishments
- Создан чистый модуль `utils/todoFilters.ts` без React-зависимостей: `isExpired`, `isToday`, `isFuture`, `sortByDate`, `filterDisplayedTodos` — логика перенесена из `App.tsx` дословно (тот же `date-fns parse("yyyy-MM-dd", ...)`, тот же порядок веток `showAll`)
- Создан хук `hooks/useTodoFilters.ts` (прецедент — `useNotifications.ts`), оборачивающий `filterDisplayedTodos` в `useMemo` с тем же массивом зависимостей, что был в `App.tsx`; хук возвращает `{ displayedTodos, isExpired, isFuture }`
- `App.tsx` стал тоньше: `displayedTodos` вычисляется через `useTodoFilters`, `renderItem` использует предикаты хука, все inline-определения предикатов/сортировки удалены вместе с ставшими лишними импортами (`isAfter`, `isSameDay`, `startOfDay` из `date-fns`, `useMemo` из `react`)
- Поведение списка задач подтверждено пользователем как идентичное версии до рефакторинга (tracer feedback gate после Task 1)

## Task Commits

Each task was committed atomically:

1. **Task 1: Создать utils/todoFilters.ts и провести displayedTodos через useTodoFilters (end-to-end)** - `eb95d36` (feat)
2. **Task 2: Перевести renderItem на предикаты хука и удалить остаточные inline-определения из App.tsx** - `b869f14` (refactor)

**Plan metadata:** (текущий коммит) `docs(03-01): complete refactor task plan`

## Files Created/Modified
- `utils/todoFilters.ts` - чистый модуль: предикаты дат (`isExpired`/`isToday`/`isFuture`), сортировка (`sortByDate`) и вычисление отображаемого списка (`filterDisplayedTodos`)
- `hooks/useTodoFilters.ts` - хук `useTodoFilters(allTodos, selectedDate, showAll)`, мемоизирующий `filterDisplayedTodos` и пробрасывающий предикаты для `renderItem`
- `App.tsx` - удалена inline бизнес-логика фильтрации/сортировки/предикатов дат; `displayedTodos` и предикаты для `renderItem` теперь берутся из `useTodoFilters`; убраны ставшие лишними импорты

## Decisions Made
- `isExpired`/`isFuture` принимают необязательный параметр `now` (по умолчанию `new Date()`) вместо жёстко вызываемого `startOfDay(new Date())` внутри — упрощает будущее unit-тестирование в Phase 4 (TEST-01) без моков глобального времени, поведение по умолчанию не меняется
- `useTodoFilters` возвращает и `displayedTodos`, и предикаты `isExpired`/`isFuture`, чтобы `App.tsx` не импортировал `utils/todoFilters.ts` напрямую для `renderItem`

## Deviations from Plan

None - план выполнен точно как написано.

## Issues Encountered
- None

## User Setup Required

None - изменения не требуют конфигурации внешних сервисов.

## Next Phase Readiness
- REF-01 (часть 1) завершена: предикаты дат, сортировка и `displayedTodos` вынесены из `App.tsx`
- `App.tsx` готов к следующему шагу REF-01 (вынос состояния/CRUD задач в `useTodos`, план 03-02) и к REF-02/REF-03 (планы 03-02/03-03)
- `utils/todoFilters.ts` — чистые функции без React, готовы к прямому unit-тестированию в Phase 4 (TEST-01) без `renderHook`

---
*Phase: 03-3-refactoring*
*Completed: 2026-07-25*

## Self-Check: PASSED

Все заявленные файлы (`utils/todoFilters.ts`, `hooks/useTodoFilters.ts`, `App.tsx`, `.planning/phases/03-3-refactoring/03-01-SUMMARY.md`) существуют на диске. Оба заявленных коммита (`eb95d36`, `b869f14`) найдены в истории git.
