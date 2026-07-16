# Requirements: wellWell

**Defined:** 2026-07-16
**Core Value:** Надёжное выполнение задач с своевременными уведомлениями

## v1 Requirements

### Notifications

- [ ] **NOTF-01**: Уведомление доставляется в течение 60 секунд после запланированного времени
- [ ] **NOTF-02**: При создании повторяющейся задачи reminder и notificationId корректно обновляются
- [ ] **NOTF-03**: При редактировании повторяющейся задачи старое уведомление отменяется и создаётся новое с актуальным временем
- [ ] **NOTF-04**: Ошибки планирования уведомлений видны пользователю и не теряются молча

### Bugfixes

- [ ] **BUGF-01**: Устранён баг с типовой небезопасностью `event: any` в `AddTodo.tsx`
- [ ] **BUGF-02**: Исправлена обработка ошибок в `storage/todoStorage.ts` и `hooks/useNotifications.ts` (пользователь видит ошибки)
- [ ] **BUGF-03**: Добавлена runtime-валидация для `Size` и `repeatFrequency`
- [ ] **BUGF-04**: Убрано дублирование логики парсинга времени между `Todo.tsx` и `useNotifications.ts`

### Refactoring

- [ ] **REF-01**: Вынесена бизнес-логика из `App.tsx` в отдельные хуки/утилиты
- [ ] **REF-02**: Упрощена функция `onTaskComplete` в `Todo.tsx` с удалением дублирования `showAlertForExpiredTask`
- [ ] **REF-03**: Добавлен cleanup и обработка ошибок в `useEffect` в `App.tsx`

### Testing

- [ ] **TEST-01**: Добавлены unit-тесты для утилит дат и фильтрации
- [ ] **TEST-02**: Добавлены unit-тесты для логики завершения задачи
- [ ] **TEST-03**: Добавлены unit-тесты для `useNotifications` (моки Expo Notifications)
- [ ] **TEST-04**: Добавлены интеграционные тесты для `todoStorage.ts`

## v2 Requirements

### Notifications

- **NOTF-05**: Группировка уведомлений на Android
- **NOTF-06**: Действия на уведомление (отметить выполненным без открытия приложения)

### UX

- **UX-01**: Темная тема
- **UX-02**: Статистика выполнения задач

## Out of Scope

| Feature | Reason |
|---------|--------|
| Серверная синхронизация | Локальное приложение, не в Core Value |
| Realtime-коллаборация | Не требуется для персонального трекера |
| OAuth / аккаунты | Нет серверной части |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NOTF-01 | Phase 1 | Pending |
| NOTF-02 | Phase 1 | Pending |
| NOTF-03 | Phase 1 | Pending |
| NOTF-04 | Phase 1 | Pending |
| BUGF-01 | Phase 2 | Pending |
| BUGF-02 | Phase 2 | Pending |
| BUGF-03 | Phase 2 | Pending |
| BUGF-04 | Phase 2 | Pending |
| REF-01 | Phase 3 | Pending |
| REF-02 | Phase 3 | Pending |
| REF-03 | Phase 3 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 4 | Pending |
| TEST-03 | Phase 4 | Pending |
| TEST-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-16*
*Last updated: 2026-07-16 after initial definition*
