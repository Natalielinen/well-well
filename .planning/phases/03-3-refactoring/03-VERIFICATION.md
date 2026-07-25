---
phase: 03-3-refactoring
verified: 2026-07-25T11:37:09Z
status: human_needed
score: 9/9 truths verified (structurally); 3 behavior-dependent truths present+wired but not re-exercised on a real device after the final commits
behavior_unverified: 3
overrides_applied: 0
behavior_unverified_items:
  - truth: "Полное поведение приложения после Task 2/3 плана 03-03 (create/update/delete задачи, планирование/отмена уведомлений, рекламный баннер, отсутствие повторной инициализации MobileAds при ре-рендере) идентично доrefactor-версии (D-06)"
    test: "Создать задачу с напоминанием, отредактировать её, удалить задачу; понаблюдать баннер рекламы и повторные ре-рендеры (навигация по датам) на реальном устройстве"
    expected: "CRUD и уведомления работают как до рефакторинга; баннер загружается; MobileAds.initialize() не вызывается повторно"
    why_human: "Требует запуска приложения на реальном устройстве (нативные модули: expo-notifications, yandex-mobile-ads); сама SUMMARY.md (03-03) прямо признаёт, что после коммитов Task 2/3 повторная человеческая проверка не проводилась (verified только Task 1 — загрузка списка)"
  - truth: "Ветка «Сегодня» showAlertForExpiredTask (nextRecurrenceDate(new Date(), repeatFrequency) + nextReminderIso) планирует уведомление на корректную дату без двойного сдвига repeatFrequency"
    test: "Отметить выполненной просроченную повторяющуюся задачу с напоминанием, выбрать кнопку «Сегодня»; проверить дату/время следующего уведомления"
    expected: "Уведомление запланировано на today + repeatFrequency дней, без накопления сдвига при повторных выполнениях"
    why_human: "Регрессия двойного сдвига (см. .planning/debug/recurring-notification-stops-after-complete.md) — уже случалась в этом коде; SUMMARY 03-02 подтверждает, что на реальном устройстве проверена только ветка onTaskComplete «повторяющаяся, не просрочена» (Task 1), а не ветки showAlertForExpiredTask (Task 2), которые проверены только статически (grep/tsc)"
  - truth: "Ветка «Дата в задаче» showAlertForExpiredTask (nextRecurrenceDate(new Date(todo.nextDate), repeatFrequency) + nextReminderIso) планирует уведомление на корректную дату без двойного сдвига repeatFrequency"
    test: "Отметить выполненной будущую или просроченную повторяющуюся задачу с напоминанием, выбрать кнопку «Дата в задаче»; проверить дату/время следующего уведомления"
    expected: "Уведомление запланировано на nextDate задачи + repeatFrequency дней, без накопления сдвига"
    why_human: "Та же причина, что и для пункта 2 — ветка не была повторно проверена на реальном устройстве после финальных коммитов плана 03-02"
human_verification:
  - test: "Полный smoke-тест приложения после планов 03-01/03-02/03-03: старт (загрузка списка), создание/редактирование/удаление задачи (с напоминанием и без), навигация по датам (не должно быть повторной инициализации MobileAds), режим «Все задачи», рекламный баннер"
    expected: "Поведение идентично доrefactor-версии, кроме однократной инициализации MobileAds.initialize() и появления Alert «Ошибка» при сбое загрузки списка (оба изменения — прямо разрешены REF-03/D-07)"
    why_human: "Нативные side-эффекты (expo-notifications, yandex-mobile-ads, AsyncStorage) не проверяются grep/tsc; SUMMARY 03-03 сама отмечает, что финальный smoke-тест после Task 2/3 не проводился"
  - test: "Отметить выполненной повторяющуюся просроченную/будущую задачу через обе кнопки Alert («Сегодня» / «Дата в задаче»); убедиться, что новое уведомление приходит один раз без накопления сдвига при 2-3 последовательных выполнениях"
    expected: "Нет регрессии бага двойного сдвига repeatFrequency (.planning/debug/recurring-notification-stops-after-complete.md); дата следующего уведомления = ожидаемая дата, без «уезжания» на лишний цикл"
    why_human: "Это runtime state-invariant (планирование локального уведомления через Expo API), непроверяемый статическим анализом; ранее уже случалась именно такая регрессия в этом же коде"
---

# Phase 3: 3-refactoring Verification Report

**Phase Goal:** Снизить технический долг и подготовить код к тестированию: вынести бизнес-логику из `App.tsx` в кастомные хуки (REF-01), упростить `onTaskComplete` и убрать дублирование `showAlertForExpiredTask` (REF-02), добавить cleanup и обработку ошибок во все `useEffect` в `App.tsx` (REF-03). Рефакторинг behavior-preserving.
**Verified:** 2026-07-25T11:37:09Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Бизнес-логика вынесена из `App.tsx` в хуки/утилиты (roadmap SC) | ✓ VERIFIED | `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `utils/todoFilters.ts`, `utils/recurrence.ts` существуют и содержат вынесенную логику; `App.tsx` — grep по `const [allTodos`, `const getAllTodos`, `const onAddTodo`, `const onUpdateTodo`, `const isExpired`, `const isToday`, `const isFuture`, `const sortByDate`, `const displayedTodos` = 0 совпадений во всех случаях |
| 2 | `App.tsx` — тонкий контейнер, композирует `useTodos` + `useTodoFilters` (D-01) | ✓ VERIFIED | `App.tsx:32` `const { allTodos, getAllTodos, onAddTodo, onUpdateTodo } = useTodos();`; `App.tsx:92-96` `const { displayedTodos, isExpired, isFuture } = useTodoFilters(allTodos, selectedDate, showAll);` — остаток файла только UI-состояние (`selectedDate`, `showAddModal`, `today`, `showAll`, `editData`, `bannerSize`, `prevDateLoading`) и рендер |
| 3 | `onTaskComplete` упрощён, дублирование `showAlertForExpiredTask` устранено через `utils/recurrence.ts` (REF-02, D-04/D-05) | ✓ VERIFIED | `components/Todo/Todo.tsx` — все 3 места вычисления следующей даты (onTaskComplete ветка "не просрочена" строка 128, showAlertForExpiredTask "Сегодня" строка 75, "Дата в задаче" строка 89) вызывают `nextRecurrenceDate`/`nextReminderIso` из `utils/recurrence.ts`; `const getUpdatedTime` = 0 совпадений; `addDays(` в Todo.tsx = 0 совпадений (весь сдвиг дат сосредоточен в утилите) |
| 4 | `utils/recurrence.ts` — единый источник правды, единственный сдвиг `repeatFrequency` (нет регрессии двойного сдвига) | ✓ VERIFIED (структурно) | `utils/recurrence.ts:11-13` — единственное место `addDays(base, repeatFrequency)`; `hooks/useNotifications.ts:58-77` `rescheduleNextNotification` явно НЕ прибавляет `repeatFrequency` повторно (комментарий строк 67-69 прямо ссылается на баг двойного сдвига); структурно баг не воспроизводится. **Runtime-подтверждение на устройстве получено только для одной из трёх веток** (см. Human Verification) |
| 5 | Все `useEffect` в `App.tsx` имеют cleanup (или обоснование) и обработку ошибок async (REF-03, D-07) | ✓ VERIFIED | `App.tsx` содержит 4 `useEffect` (grep `useEffect(` = 4): (1) `BannerAdSize.stickySize` — mounted-guard cleanup (строки 40-56) + `.catch`; (2) `MobileAds.initialize()` — `[]` deps (строка 90) + `try/catch` (строки 81-88); (3) mount-эффект `setToday`/`setShowAll` — синхронный, снабжён комментарием об отсутствии cleanup (строки 98-104); (4) `setToday` по `selectedDate` — синхронный, комментарий (строки 106-109) |
| 6 | `MobileAds.initialize()` выполняется один раз (массив зависимостей `[]`), а не на каждый рендер (REF-03, D-07) | ✓ VERIFIED | `App.tsx:80-90` — `useEffect(() => { (async () => {...})(); }, [])`; ранее эффект был без массива зависимостей (описано в 03-CONTEXT.md/03-03-PLAN.md); теперь `[]` гарантирует однократный запуск по семантике React (эффект не зависит от props/state) |
| 7 | `hooks/useTodos.ts` инкапсулирует CRUD и загрузку с cleanup + обработкой ошибок (REF-01, REF-03) | ✓ VERIFIED | `hooks/useTodos.ts:19-39` — mount-эффект с mounted-guard cleanup (строки 20, 36-38) и `try/catch` + `Alert.alert("Ошибка", "Не удалось загрузить список задач")` (строки 23-33); `onAddTodo`/`onUpdateTodo` (строки 41-92) оборачивают `scheduleNotification`/`cancelNotification` в `try/catch` с пользовательскими Alert |
| 8 | Основные модули имеют чёткие границы ответственности (roadmap SC) | ✓ VERIFIED | `App.tsx` = UI-композиция; `hooks/useTodos.ts` = state+CRUD задач; `hooks/useTodoFilters.ts` = мемоизация отображаемого списка; `utils/todoFilters.ts` = чистые предикаты/сортировка; `utils/recurrence.ts` = чистая логика дат повторения; `Todo.tsx` = UI + Alert-флоу единственного элемента |
| 9 | Alert-флоу (тексты, кнопки, порядок) `onTaskComplete`/`showAlertForExpiredTask` не изменились (D-06) | ✓ VERIFIED (текст) | Тексты `"Внимание!"`, `"Дата выполнения задачи еще не наступила..."`, `"Задача была просрочена..."`, кнопки `"Сегодня"`/`"Дата в задаче"`, финальный Alert `"Выполнена повторяющаяся задача. Дата следующего выполнения: ..."` — присутствуют дословно в `Todo.tsx:65-101, 138-141` |
| 10 | Полное наблюдаемое поведение приложения (CRUD, уведомления, баннер, навигация) после всех трёх планов идентично доrefactor-версии, кроме разрешённых REF-03 изменений (D-06) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Код структурно корректен (см. пункты 1-9), но `03-03-SUMMARY.md` coverage D4 сама признаёт: "остаток поведения (CRUD, useEffect-фиксы) человеком не перепроверялась после финальных коммитов — рекомендуется smoke-тест перед Phase 4". Runtime-подтверждение получено только для загрузки списка (Task 1 плана 03-03) |

**Score:** 9/9 структурных truths верифицированы кодом; 1 truth (полное runtime-поведение) и связанные с ним 2 ветки recurrence остаются present+wired, но не переподтверждены на устройстве после финальных коммитов → маршрутизируются в human_needed.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `utils/todoFilters.ts` | Чистый модуль: `isExpired`, `isToday`, `isFuture`, `sortByDate`, `filterDisplayedTodos` | ✓ VERIFIED | 5 экспортов, 0 импортов из `react`, вызывается из `hooks/useTodoFilters.ts` |
| `hooks/useTodoFilters.ts` | Хук `useTodoFilters(allTodos, selectedDate, showAll)` → `{displayedTodos, isExpired, isFuture}` | ✓ VERIFIED | `useMemo` с зависимостями `[allTodos, selectedDate, showAll]`, импортирует из `../utils/todoFilters`, используется в `App.tsx:92-96` |
| `utils/recurrence.ts` | Чистый модуль: `nextRecurrenceDate`, `nextReminderIso` | ✓ VERIFIED | 0 импортов из `react`, единственное место `addDays`, `toISOString()` для reminder; используется в `Todo.tsx` (3 вызова) |
| `hooks/useTodos.ts` | Хук `useTodos()` → `{allTodos, getAllTodos, onAddTodo, onUpdateTodo}` | ✓ VERIFIED | Инкапсулирует state, mount-загрузку (cleanup+error), CRUD с планированием уведомлений; используется в `App.tsx:32` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `App.tsx` | `utils/todoFilters.ts` | `useTodoFilters(allTodos, selectedDate, showAll)` | ✓ WIRED | `App.tsx:92-96`; `hooks/useTodoFilters.ts:3,10-13` вызывает `filterDisplayedTodos` |
| `Todo.tsx` (`onTaskComplete`/`showAlertForExpiredTask`) | `utils/recurrence.ts` → `handleCompleteTask` → `rescheduleNextNotification` | `nextRecurrenceDate`/`nextReminderIso` | ✓ WIRED | `Todo.tsx:75,80,89,94,128,136` вызывают утилиту; `handleCompleteTask` (строка 38) вызывает `rescheduleNextNotification` (импорт строка 20) |
| `App.tsx` | `hooks/useTodos.ts` → `hooks/useTodoFilters.ts` | композиция | ✓ WIRED | `App.tsx:32,92` |
| `hooks/useTodos.ts` | `storage/todoStorage.ts` + `hooks/useNotifications.ts` | `loadTodos/addTodo/updateTodo` + `scheduleNotification/cancelNotification` | ✓ WIRED | `useTodos.ts:4-5,10,13,24,48,60,68,75,90` |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Компиляция TypeScript | `npx tsc --noEmit` | exit 0 | ✓ PASS |
| Отсутствие inline-логики в `App.tsx` | `grep -n "const \[allTodos\|const getAllTodos\|const onAddTodo\|const onUpdateTodo\|const displayedTodos\|const isExpired\|const isToday\|const isFuture\|const sortByDate" App.tsx` | без совпадений | ✓ PASS |
| Отсутствие `getUpdatedTime`/`addDays` в `Todo.tsx` | `grep -n "const getUpdatedTime\|addDays(" components/Todo/Todo.tsx` | без совпадений | ✓ PASS |
| Число `useEffect` в `App.tsx` | `grep -c "useEffect(" App.tsx` | `4` | ✓ PASS |
| Отсутствие debt-маркеров (TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER) | `grep -nE "TBD\|FIXME\|XXX\|HACK\|PLACEHOLDER"` + `grep -nE "\bTODO\b"` по всем изменённым файлам | без совпадений | ✓ PASS |
| Запуск приложения на устройстве (Expo notifications, yandex-mobile-ads) | — | не выполнялось | ? SKIP (нативные модули, требуется реальное устройство — см. Human Verification) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REF-01 | 03-01, 03-03 | Вынесена бизнес-логика из `App.tsx` в отдельные хуки/утилиты | ✓ SATISFIED | `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `utils/todoFilters.ts` созданы; `App.tsx` не содержит inline state/CRUD/предикатов |
| REF-02 | 03-02 | Упрощена `onTaskComplete`, устранено дублирование `showAlertForExpiredTask` | ✓ SATISFIED (структура); ⚠️ runtime для 2 из 3 веток не переподтверждён | `utils/recurrence.ts` — единый источник правды для всех 3 мест вычисления даты в `Todo.tsx` |
| REF-03 | 03-03 | Добавлен cleanup и обработка ошибок в `useEffect` в `App.tsx` | ✓ SATISFIED | Все 4 `useEffect` в `App.tsx` имеют cleanup/обоснование + обработку ошибок; `MobileAds.initialize()` — `[]` deps |

Ни одного orphaned requirement — REQUIREMENTS.md § Phase 3 (строки 67-69) сопоставляет ровно REF-01/02/03 с Phase 3, все три заявлены в PLAN frontmatter (03-01: REF-01, 03-02: REF-02, 03-03: REF-01+REF-03).

### Anti-Patterns Found

Debt-маркеры (`TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`) и типичные стаб-паттерны (`return null`, пустые обработчики, hardcoded `[]`/`{}` в местах рендера) не найдены ни в одном из изменённых файлов (`App.tsx`, `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `utils/todoFilters.ts`, `utils/recurrence.ts`, `components/Todo/Todo.tsx`). Блокеров не обнаружено.

### Human Verification Required

### 1. Полный smoke-тест приложения после всех трёх планов

**Test:** Запустить приложение на реальном устройстве: старт (загрузка списка), создание задачи с напоминанием и без, редактирование, удаление, навигация по датам (несколько ре-рендеров подряд), режим «Все задачи», наблюдение за рекламным баннером.
**Expected:** Поведение идентично доrefactor-версии, кроме однократной инициализации `MobileAds.initialize()` (не должно быть повторных вызовов при ре-рендерах) и появления Alert «Ошибка» при сбое загрузки списка (оба изменения прямо разрешены REF-03/D-07).
**Why human:** Нативные side-эффекты (`expo-notifications`, `yandex-mobile-ads`, `AsyncStorage`) невозможно проверить статическим анализом; `03-03-SUMMARY.md` (coverage D4, rationale) сама признаёт, что после финальных коммитов Task 2/3 повторная проверка на устройстве не проводилась — верифицирована только загрузка списка (Task 1).

### 2. Обе ветки showAlertForExpiredTask — отсутствие регрессии двойного сдвига repeatFrequency

**Test:** Отметить выполненной (а) просроченную и (б) будущую повторяющуюся задачу с напоминанием; в обоих случаях выбрать поочерёдно кнопки «Сегодня» и «Дата в задаче» (на разных задачах); повторить выполнение 2-3 раза подряд на одной задаче.
**Expected:** Новая дата и время уведомления рассчитываются корректно (без «уезжания» на лишний цикл при повторных выполнениях); соответствует поведению, задокументированному в `.planning/debug/recurring-notification-stops-after-complete.md` как ожидаемое после фикса.
**Why human:** Это runtime state/ordering-инвариант (планирование локального уведомления Expo), непроверяемый grep/tsc; `03-02-SUMMARY.md` подтверждает, что на устройстве проверена только ветка `onTaskComplete` «повторяющаяся не просроченная» (Task 1), а обе ветки `showAlertForExpiredTask` (Task 2) проверены только статически.

### Gaps Summary

Структурных пробелов (FAILED) не обнаружено: все артефакты существуют, содержательны и подключены; `npx tsc --noEmit` = 0; grep-проверки acceptance criteria из всех трёх PLAN проходят; debt-маркеров и типичных стаб-паттернов нет; тексты Alert дословно сохранены. REF-01/02/03 реализованы структурно корректно, единый источник правды для дат повторения (`utils/recurrence.ts`) устраняет дублирование и предотвращает (по коду) регрессию бага двойного сдвига `repeatFrequency`.

Единственный открытый вопрос — сами SUMMARY.md планов 03-02 и 03-03 честно документируют, что **не вся** зона поведенческой эквивалентности (D-06) была переподтверждена на реальном устройстве после финальных коммитов: только tracer-срезы (одна ветка `onTaskComplete`, загрузка списка) прошли ручную проверку в момент выполнения; ветки `showAlertForExpiredTask` (структурный риск двойного сдвига, ранее уже случавшегося в этом коде) и полный CRUD/useEffect-флоу после финальных коммитов — не проверены. Это не свидетельствует о дефекте (код статически корректен), но и не является закрытым вопросом без runtime-подтверждения — отсюда `status: human_needed`, а не `passed`.

---

_Verified: 2026-07-25T11:37:09Z_
_Verifier: Claude (gsd-verifier)_
