# ROADMAP

## Overview

| Phase | Name | Plans | Requirements | Status |
|-------|------|-------|--------------|--------|
| 1 | Fix notifications | 3 | NOTF-01, NOTF-02, NOTF-03, NOTF-04 | In Progress|
| 2 | Fix known bugs | 2 | BUGF-01, BUGF-02, BUGF-03, BUGF-04 | ○ |
| 3 | Refactoring | 2 | REF-01, REF-02, REF-03 | ○ |
| 4 | Testing | 2 | TEST-01, TEST-02, TEST-03, TEST-04 | ○ |

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

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 1
**Plans:** 0 plans

Plans:

- [ ] TBD (run /gsd-plan-phase 2 to break down)

### Phase 3: 3 Refactoring

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 2
**Plans:** 0 plans

Plans:

- [ ] TBD (run /gsd-plan-phase 3 to break down)

### Phase 4: 4 Testing

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 3
**Plans:** 0 plans

Plans:

- [ ] TBD (run /gsd-plan-phase 4 to break down)

---
*Roadmap created: 2026-07-16*
