# ROADMAP

## Overview

| Phase | Name | Plans | Requirements | Status |
|-------|------|-------|--------------|--------|
| 1 | Fix notifications | 3 | NOTF-01, NOTF-02, NOTF-03, NOTF-04 | In Progress|
| 2 | Fix known bugs | 2 | BUGF-01, BUGF-02, BUGF-03, BUGF-04 | Complete    |
| 3 | Refactoring | 3 | REF-01, REF-02, REF-03 | Complete    |
| 03.1 | Fix new known bugs (INSERTED) | — | BUGF-05, BUGF-06, BUGF-07, BUGF-08, BUGF-09, BUGF-10 | ○ |
| 4 | Testing | 3 | TEST-01, TEST-02, TEST-03, TEST-04 | ○ |

## Phase 1 — Fix notifications

Goal: Надёжная доставка уведомлений и корректное обновление reminder/notificationId при создании и редактировании повторяющихся задач.

Requirements: NOTF-01, NOTF-02, NOTF-03, NOTF-04

Context:

- Сейчас `scheduleNotification` отказывается создавать уведомление, если дата в прошлом.
- Нет гарантии, что `notificationId` соответствует актуальному запланированному уведомлению.
- При редактировании задачи старый `notificationId` сбрасывается, но новый может не создаться.
- Ошибки только логируются, пользователь не видит проблем.

Success criteria:

- Уведомление доставляется не позднее чем через 60 секунд после запланированного времени.
- При создании повторяющейся задачи reminder и notificationId корректно сохраняются.
- При редактировании повторяющейся задачи старое уведомление отменяется, создаётся новое с актуальным временем.
- Ошибки планирования показываются пользователю.

## Phase 2 — Fix known bugs

Goal: Устранить известные баги и уязвимости из `.planning/codebase/CONCERNS.md`.

Requirements: BUGF-01, BUGF-02, BUGF-03, BUGF-04

Context:

- `AddTodo.tsx` использует `event: any`.
- Ошибки в storage и notifications только логируются.
- Нет валидации `Size` и `repeatFrequency`.
- Дублирование парсинга времени между `Todo.tsx` и `useNotifications.ts`.

Success criteria:

- Нет `any` типов в обработчиках событий.
- Ошибки показываются пользователю или пробрасываются наверх.
- Добавлена runtime-валидация критичных полей.
- Логика времени вынесена в общую утилиту.

## Phase 3 — Refactoring

Goal: Снизить технический долг и подготовить код к тестированию.

Requirements: REF-01, REF-02, REF-03

Context:

- `App.tsx` — монолит ~270 строк со state и бизнес-логикой.
- `Todo.tsx` содержит тяжёлую логику завершения задачи с Alert-ами.
- `useEffect` в `App.tsx` без cleanup и обработки ошибок.

Success criteria:

- Бизнес-логика вынесена из `App.tsx` в хуки/утилиты.
- `onTaskComplete` упрощён, дублирование удалено.
- Все `useEffect` имеют cleanup и обработку ошибок.
- Основные модули имеют чёткие границы ответственности.

## Phase 4 — Testing

Goal: Покрыть код тестами для стабилизации изменений.

Requirements: TEST-01, TEST-02, TEST-03, TEST-04

Context:

- В проекте нет тестов.
- Основная логика дат, фильтрации, уведомлений и хранилища требует покрытия.

Success criteria:

- Unit-тесты для утилит дат и фильтрации.
- Unit-тесты для логики завершения задачи.
- Unit-тесты для `useNotifications` с моками Expo Notifications.
- Интеграционные тесты для `todoStorage.ts`.

### Phase 1: 1 Fix notifications

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 5/5 plans executed

Plans:

- [x] 01-PLAN.md
- [x] 02-PLAN.md
- [x] 03-PLAN.md
- [x] 04-PLAN.md
- [x] 05-PLAN.md

### Phase 2: 2 Fix known bugs

**Goal:** Устранить известные баги и типобезопасные уязвимости: BUGF-01 (тип `event: any` в `AddTodo.tsx`), BUGF-02 (показ ошибок пользователю в storage/notifications), BUGF-03 (runtime-валидация `Size`/`repeatFrequency`), BUGF-04 (вынос дублирующегося парсинга времени в общую утилиту).
**Requirements**: BUGF-01, BUGF-02, BUGF-03, BUGF-04
**Depends on:** Phase 1
**Plans:** 4/4 plans executed

Plans:

- [x] 02-01-PLAN.md — BUGF-04: общая утилита времени utils/time.ts и миграция потребителей
- [x] 02-02-PLAN.md — BUGF-01: типобезопасность обработчиков DateTimePicker в AddTodo.tsx
- [x] 02-03-PLAN.md — BUGF-02: проброс ошибок storage и notifications пользователю
- [ ] 02-04-PLAN.md — BUGF-03: runtime-валидация Size и repeatFrequency

### Phase 3: 3 Refactoring

**Goal:** Снизить технический долг и подготовить код к тестированию: вынести бизнес-логику из `App.tsx` в кастомные хуки (REF-01), упростить `onTaskComplete` и убрать дублирование `showAlertForExpiredTask` (REF-02), добавить cleanup и обработку ошибок во все `useEffect` в `App.tsx` (REF-03). Рефакторинг behavior-preserving.
**Requirements**: REF-01, REF-02, REF-03
**Depends on:** Phase 2
**Plans:** 3/3 plans executed

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — REF-01 (часть 1): вынос фильтрации/сортировки/предикатов дат в utils/todoFilters.ts + hooks/useTodoFilters.ts
- [x] 03-02-PLAN.md — REF-02: utils/recurrence.ts и упрощение onTaskComplete/showAlertForExpiredTask в Todo.tsx

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-03-PLAN.md — REF-01 (часть 2) + REF-03: hooks/useTodos.ts, тонкий App.tsx, cleanup и обработка ошибок во всех useEffect

### Phase 03.1: Fix new known bugs (INSERTED)

**Goal:** Исправить баги, найденные при повторном картировании кода (`.planning/codebase/CONCERNS.md`, 2026-10-24), до написания тестов в Phase 4 — чтобы тесты фиксировали уже корректное поведение: отмена уведомления при выполнении неповторяющейся задачи (BUGF-05), единая работа с датами как с локальными календарными строками без сдвига на сутки (BUGF-06), обновление списка после выполнения независимо от Alert (BUGF-07), сохранение по актуальной записи вместо устаревшего пропса (BUGF-08), консистентное состояние при ошибке планирования уведомления (BUGF-09), валидация прошедшего времени напоминания вместо тихого переноса на +60 с (BUGF-10).
**Requirements**: BUGF-05, BUGF-06, BUGF-07, BUGF-08, BUGF-09, BUGF-10
**Depends on:** Phase 3
**Plans:** 0 plans

Context:

- `components/Todo/Todo.tsx` (`onTaskComplete`, ветка `!todo.isRepeat`) вызывает `removeTodo` без `cancelNotification` — подтверждено в коде.
- `components/WeekStrip/WeekStrip.tsx` сравнивает даты через `toISOString().split("T")[0]` — в UTC+3 локальная полночь даёт предыдущий день; `utils/todoFilters.ts` парсит локально через `parse(...)`, а `Todo.tsx`/`utils/recurrence.ts` — через `new Date("yyyy-MM-dd")` (UTC).
- `Todo.tsx` вызывает `getAllTodos()` только из кнопки Alert; на Android Alert закрывается тапом вне окна.
- `handleCompleteTask` сохраняет `{ ...todo }` из пропса, `updateTodo` перезаписывает запись целиком.
- `hooks/useTodos.ts` (`onUpdateTodo`): при ошибке `scheduleNotification` старое уведомление уже отменено, а `reminderDate` остаётся. Пересекается с NOTF-04 (Phase 1).
- `hooks/useNotifications.ts` (`getEffectiveReminderDate`) молча подменяет прошедшее время на now + 60 с.
- Регрессионный контракт Phase 3/4 сохраняется: единственный сдвиг `repeatFrequency` при завершении.

Success criteria:

- После выполнения неповторяющейся задачи её уведомление отменено (нет в `getAllScheduledNotificationsAsync`).
- В UTC+3 и UTC−5 точки в `WeekStrip`, фильтры и дата на карточке показывают один и тот же календарный день; парсинг/форматирование `nextDate` идёт через одну утилиту в `utils/time.ts`, `new Date("yyyy-MM-dd")` и `toISOString()` для календарных дат в коде не осталось.
- Список обновляется сразу после выполнения задачи, даже если Alert закрыт тапом вне окна.
- Выполнение задачи не затирает поля, изменённые после рендера карточки (обновление по `id` из хранилища).
- При ошибке планирования напоминания задача сохраняется без `reminderDate`/`notificationId`, пользователь видит, что напоминание не сохранено.
- Выбор прошедшего времени напоминания в `AddTodo` показывает ошибку валидации вместо тихого переноса.

Plans:
- [ ] TBD (run /gsd-plan-phase 03.1 to break down)

### Phase 4: 4 Testing

**Goal:** Покрыть код автоматическими тестами для стабилизации изменений после Phase 3: unit-тесты чистых утилит дат/фильтрации (TEST-01) и логики повторения (TEST-02), unit-тесты `hooks/useNotifications.ts` с моками `expo-notifications` (TEST-03), интеграционные тесты `storage/todoStorage.ts` с official AsyncStorage mock (TEST-04). Включает первичную настройку `jest-expo`. Регрессионный контракт: единственный сдвиг `repeatFrequency` при завершении.
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Depends on:** Phase 03.1
**Plans:** 3 plans

Plans:
**Wave 1**

- [ ] 04-01-PLAN.md — Тулчейн jest-expo + первый зелёный тест utils/time.ts (TEST-01); legitimacy-checkpoint jest-expo

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 04-02-PLAN.md — Чистые утилиты: todoFilters (TEST-01) + recurrence (TEST-02, регрессия единственного сдвига)
- [ ] 04-03-PLAN.md — Мокируемые модули: useNotifications с expo-notifications mock (TEST-03) + todoStorage с AsyncStorage mock (TEST-04)

---
*Roadmap created: 2026-07-16*
