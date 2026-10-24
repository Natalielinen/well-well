---
gsd_state_version: "1.0"
milestone: v1.0
status: in_progress
stopped_at: Phase 03.1 planned
last_updated: "2026-10-24T08:05:29.597Z"
state_head: 1f37441e4f0559d7305bfe1afab1fa5757b48c40
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 19
  completed_plans: 12
milestone_name: milestone
current_phase_name: Fix new known bugs (INSERTED)
---

# STATE

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-07-16)

**Core value:** Надёжное выполнение задач с своевременными уведомлениями
**Current focus:** Phase 03.1 (Fix new known bugs) спланирована — 4 плана в 2 волнах, готова к выполнению

## Progress

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1     | Awaiting verification | 3/3   | Executed |
| 2     | ✓ Complete | 4/4   | 100%     |
| 3     | ✓ Complete | 3/3   | 100%     |
| 03.1  | Ready to execute | 0/4   | Planned  |
| 4     | Ready to execute (после 03.1) | 0/3   | Planned  |

## Next Actions

1. Выполнить Phase 03.1 — `/gsd-execute-phase 03.1` (wave 1: 03.1-01, 03.1-02; wave 2: 03.1-03, 03.1-04).
2. После 03.1 перепроверить планы Phase 4: 04-02 тестирует `utils/todoFilters.ts`/`utils/recurrence.ts`, а BUGF-06 меняет парсинг дат.
3. Выполнить Phase 4 (Testing) — `/gsd-execute-phase 4`. Wave 1 (04-01) поднимает jest-expo и первый зелёный тест; на `jest-expo` стоит human-verify checkpoint (сработает даже в yolo). Wave 2 (04-02, 04-03) — параллельно после тулчейна.
4. Опционально до выполнения: ручной smoke-тест 2 пунктов из 03-VERIFICATION.md (просроченная/будущая повторяющаяся задача; CRUD + баннер после выноса в useTodos).

---

*Last updated: 2026-10-24 after planning Phase 03.1*

## Session

**Last session:** 2026-10-24T07:20:58.276Z
**Stopped at:** Phase 03.1 planned (4 плана, готова к выполнению)
**Resume file:** .planning/phases/03.1-fix-new-known-bugs/03.1-01-PLAN.md

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 03 P01 | 18min | 2 tasks | 3 files |
| Phase 03 P02 | 15min | 2 tasks | 2 files |
| Phase 03 P03 | 8min | 3 tasks | 2 files |

## Decisions

- [Phase 03]: isExpired/isFuture принимают необязательный now (default new Date()) для будущего unit-тестирования без моков времени
- [Phase 03]: nextReminderIso поглощает formatTime целиком — вызывающий код передаёт reminderDate как есть, без предварительного вычисления reminderTime
- [Phase 03]: useTodos вызывает useNotifications() внутри себя (инкапсуляция уведомлений вместе с CRUD задач), а не принимает их параметрами извне
- [Phase 03.1, planning override]: планы приняты пользователем при 2 оставшихся WARNING plan-checker (итерация 2): (1) часть must_haves.truths в 03.1-01/02 описывает контракт функций, а не наблюдаемое поведение; (2) в 03.1-02 проверка разрешения отклоняет напоминание при любом статусе ≠ "granted", включая "undetermined" — на эмуляторе (requestPermissions выходит при !Device.isDevice) все напоминания будут отклоняться с подсказкой «разрешите уведомления». Учесть при выполнении/верификации 03.1-02.

## Accumulated Context

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: Fix new known bugs (BUGF-05..10 из CONCERNS.md 2026-10-24), до тестирования (URGENT)
