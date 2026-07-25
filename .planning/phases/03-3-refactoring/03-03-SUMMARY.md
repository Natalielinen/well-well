---
phase: 03-3-refactoring
plan: 03
subsystem: ui
tags: [react-native, hooks, custom-hooks, useeffect, cleanup]

requires:
  - phase: 03-3-refactoring
    provides: "hooks/useTodoFilters.ts и utils/todoFilters.ts (план 03-01) — источник displayedTodos/isExpired/isFuture, с которым композируется useTodos"
provides:
  - "Кастомный хук hooks/useTodos.ts, инкапсулирующий state allTodos, загрузку из storage и CRUD (getAllTodos, onAddTodo, onUpdateTodo)"
  - "App.tsx — тонкий контейнер: композиция useTodos + useTodoFilters, без inline бизнес-логики задач"
  - "Все useEffect в App.tsx с cleanup (или обоснованием его отсутствия) и обработкой ошибок async-операций; MobileAds.initialize() выполняется один раз"
affects: [04-testing]

tech-stack:
  added: []
  patterns: ["Кастомные хуки в hooks/*.ts инкапсулируют state + side-эффекты (прецедент useNotifications.ts), App.tsx — только композиция хуков и рендер"]

key-files:
  created:
    - hooks/useTodos.ts
  modified:
    - App.tsx

key-decisions:
  - "useTodos экспортирует { allTodos, getAllTodos, onAddTodo, onUpdateTodo } — вызывает useNotifications() внутри себя для доступа к scheduleNotification/cancelNotification, как и было в App.tsx"
  - "Загрузка при монтировании реализована через mounted-guard (переменная mounted в замыкании useEffect), а не через AbortController — согласуется с паттерном cleanup в useNotifications.ts (remove() у listener'ов) и не требует отмены самого промиса loadTodos()"
  - "Сбой загрузки списка задач и сбой MobileAds.initialize() показываются/логируются по-разному: Alert.alert для загрузки задач (сценарий, видимый и критичный для пользователя — пустой список), console.log для рекламного SDK и размера баннера (не блокирует основной функционал приложения, недостаточно критично для модального Alert)"

patterns-established:
  - "Кастомный хук = state + side-эффекты + мутации одного домена (задачи → useTodos, уведомления → useNotifications); App.tsx только композирует хуки и передаёт данные/колбэки в презентационные компоненты"
  - "Каждый useEffect с async-операцией: mounted-guard в cleanup + try/catch (или .catch) вокруг await; синхронные useEffect помечаются комментарием, почему cleanup не нужен"

requirements-completed: [REF-01, REF-03]

coverage:
  - id: D1
    description: "hooks/useTodos.ts создан, инкапсулирует state allTodos и загрузку из storage; загрузка при монтировании имеет cleanup (mounted-guard) и try/catch с Alert при ошибке"
    requirement: "REF-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -n 'export function useTodos' hooks/useTodos.ts; grep -c 'const getAllTodos' App.tsx = 0; grep -c 'const \\[allTodos, setAllTodos\\]' App.tsx = 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "onAddTodo/onUpdateTodo перенесены дословно в useTodos (планирование/отмена уведомлений, addTodo/updateTodo, обновление allTodos); App.tsx — тонкий контейнер без inline CRUD, контракт callback'ов вниз (Header/WeekStrip/Todo/AddTodo) не изменён"
    requirement: "REF-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -c 'const onAddTodo' App.tsx = 0; grep -c 'const onUpdateTodo' App.tsx = 0; grep -n 'const onAddTodo|const onUpdateTodo' hooks/useTodos.ts находит обе функции; тексты Alert 'Не удалось запланировать уведомление'/'Не удалось обновить уведомление' сохранены дословно"
        status: pass
    human_judgment: false
  - id: D3
    description: "Все 4 useEffect в App.tsx имеют cleanup (BannerAdSize, MobileAds.initialize) либо комментарий-обоснование отсутствия cleanup (два синхронных setToday-эффекта); async-эффекты обёрнуты в обработку ошибок; MobileAds.initialize() получил массив зависимостей [] (выполняется один раз, а не на каждый рендер)"
    requirement: "REF-03"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0); grep -c 'useEffect(' App.tsx = 4; MobileAds.initialize() находится внутри useEffect с [] в конце"
        status: pass
    human_judgment: false
  - id: D4
    description: "Наблюдаемое поведение приложения не изменилось (behavior-preserving, D-06), кроме однократной инициализации MobileAds (прямо разрешено REF-03/D-07): загрузка списка при старте, create/update/delete задачи с планированием уведомлений, навигация по датам, рекламный баннер работают идентично доrefactor-версии; путь ошибки загрузки списка теперь виден пользователю через Alert"
    verification:
      - kind: manual_procedural
        ref: "Ручная проверка на реальном устройстве после Task 1 (tracer-срез, checkpoint approved координатором): загрузка списка при старте подтверждена идентичной доrefactor-версии"
        status: pass
    human_judgment: true
    rationale: "Полная визуальная/функциональная эквивалентность UI (create/update/delete задач, уведомления, рекламный баннер) после Task 2/3 не поддаётся автоматической проверке без renderHook/e2e-инфраструктуры (добавляется в Phase 4, TEST-01); координатор подтвердил tracer-срез (загрузку списка) на реальном устройстве, остаток поведения (CRUD, useEffect-фиксы) человеком не перепроверялся после финальных коммитов — рекомендуется smoke-тест перед Phase 4."

duration: 8min
completed: 2026-07-25
status: complete
---

# Phase 03: План 03 — Вынос useTodos и REF-03 (cleanup/ошибки в useEffect) Summary

**`hooks/useTodos.ts` инкапсулирует state задач, загрузку из storage и CRUD (onAddTodo/onUpdateTodo); App.tsx стал тонким контейнером (useTodos + useTodoFilters), все useEffect получили cleanup/обработку ошибок, MobileAds.initialize() теперь выполняется один раз**

## Performance

- **Duration:** 8 мин между коммитами Task 1 и Task 3 (плюс пауза на ручную проверку пользователем tracer-среза Task 1 на реальном устройстве, подтверждено координатором)
- **Started:** 2026-07-25T14:19:22+03:00
- **Completed:** 2026-07-25T14:27:04+03:00
- **Tasks:** 3
- **Files modified:** 2 (1 создан — `hooks/useTodos.ts`, 1 изменён — `App.tsx`)

## Accomplishments
- Создан кастомный хук `hooks/useTodos.ts` (прецедент — `useNotifications.ts`): держит `allTodos`, загружает список из `storage/todoStorage.ts` при монтировании с cleanup через mounted-guard и `try/catch` + `Alert.alert("Ошибка", "Не удалось загрузить список задач")` при сбое (раньше ошибка молча терялась)
- `onAddTodo`/`onUpdateTodo` перенесены из `App.tsx` в `useTodos` дословно: та же логика планирования/отмены уведомлений через `scheduleNotification`/`cancelNotification` (вызывает `useNotifications()` внутри себя), те же тексты Alert об ошибках уведомлений, то же обновление `allTodos`/storage
- `App.tsx` стал тонким контейнером: композирует `useTodos()` + `useTodoFilters(allTodos, selectedDate, showAll)`, не содержит inline `getAllTodos`/`onAddTodo`/`onUpdateTodo`/state `allTodos`; контракт callback'ов вниз (в `Header`, `WeekStrip`, `Todo`, `AddTodo`) не изменён
- Все 4 `useEffect` в `App.tsx` приведены к требованиям REF-03 (D-07): `BannerAdSize.stickySize` получил mounted-guard cleanup и `.catch`; `MobileAds.initialize()` получил массив зависимостей `[]` (выполняется один раз вместо каждого рендера — единственное намеренное изменение поведения) и `try/catch`; два синхронных `setToday`-эффекта помечены комментарием, почему cleanup не требуется

## Task Commits

Each task was committed atomically:

1. **Task 1: Создать hooks/useTodos.ts с загрузкой при монтировании (cleanup + обработка ошибок) и провести её в App.tsx end-to-end** - `8e59096` (feat)
2. **Task 2: Перенести onAddTodo/onUpdateTodo в useTodos и сделать App.tsx тонким контейнером** - `959f547` (refactor)
3. **Task 3: REF-03 — cleanup и обработка ошибок во всех оставшихся useEffect App.tsx (+ фикс массива зависимостей MobileAds.initialize)** - `c1216bc` (fix)

**Plan metadata:** (текущий коммит) `docs(03-03): complete refactor task plan`

_Между Task 1 и Task 2 — пауза на tracer feedback gate: координатор подтвердил на реальном устройстве, что загрузка списка задач при старте работает идентично доrefactor-версии, прежде чем продолжить с Task 2/3._

## Files Created/Modified
- `hooks/useTodos.ts` - кастомный хук `useTodos()`: state `allTodos`, `getAllTodos` (ручная загрузка), mount-эффект загрузки с cleanup+обработкой ошибок, `onAddTodo`/`onUpdateTodo` (планирование уведомлений + storage + обновление state)
- `App.tsx` - удалены inline `allTodos`/`getAllTodos`/`onAddTodo`/`onUpdateTodo`/mount-эффект загрузки (теперь из `useTodos()`); все `useEffect` получили cleanup/комментарий-обоснование и обработку ошибок; `MobileAds.initialize()` теперь в эффекте с `[]`; убран ставший ненужным импорт `Alert`, `useNotifications`, `addTodo`/`updateTodo`/`loadTodos` из `storage/todoStorage`

## Decisions Made
- `useTodos` вызывает `useNotifications()` внутри себя (а не принимает `scheduleNotification`/`cancelNotification` как параметры) — сохраняет прежний способ доступа к уведомлениям без изменения публичного API `useNotifications`
- Загрузка при монтировании использует mounted-guard (переменная `mounted` в замыкании), а не `AbortController` — согласуется с паттерном cleanup в `useNotifications.ts` (`remove()` у listener'ов), `loadTodos()` не поддерживает отмену запроса
- Ошибка загрузки списка задач показывается через `Alert.alert` (критичный для пользователя сценарий — пустой список), ошибки `BannerAdSize.stickySize`/`MobileAds.initialize()` — через `console.log` (не блокируют основной функционал приложения, не требуют модального прерывания)

## Deviations from Plan

None - план выполнен точно как написано, включая структуру трёх атомарных коммитов (Task 1: загрузка → Task 2: CRUD → Task 3: cleanup/ошибки в useEffect).

## Issues Encountered
- None

## User Setup Required

None - изменения не требуют конфигурации внешних сервисов.

## Next Phase Readiness
- REF-01 полностью завершена (обе части: план 03-01 — фильтрация/сортировка, план 03-03 — state/CRUD/загрузка задач): `App.tsx` — тонкий контейнер, вся бизнес-логика в `hooks/`/`utils/`
- REF-03 завершена: все `useEffect` в `App.tsx` имеют cleanup и обработку ошибок async-операций; `MobileAds.initialize()` больше не выполняется на каждый рендер
- Phase 3 (3-refactoring) полностью завершена (планы 03-01, 03-02, 03-03) — REF-01, REF-02, REF-03 выполнены
- `hooks/useTodos.ts` и `hooks/useTodoFilters.ts` готовы к unit/hook-тестированию в Phase 4 (TEST-01); дальнейшая ручная проверка CRUD/уведомлений/рекламного баннера после Task 2/3 рекомендуется перед стартом Phase 4 (см. rationale в coverage D4)

---
*Phase: 03-3-refactoring*
*Completed: 2026-07-25*

## Self-Check: PASSED

Все заявленные файлы (`hooks/useTodos.ts`, `App.tsx`, `.planning/phases/03-3-refactoring/03-03-SUMMARY.md`) существуют на диске. Все три заявленных коммита (`8e59096`, `959f547`, `c1216bc`) найдены в истории git.
