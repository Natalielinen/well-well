---
gsd_state_version: "1.0"
milestone: v1.0
status: in_progress
stopped_at: Phase 03.1 awaits native UAT (human_needed)
last_updated: "2026-11-21T07:40:25Z"
state_head: 86e29c4d06e9f8251fce98b0c7ca4f5924c93479
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 19
  completed_plans: 16
milestone_name: milestone
current_phase_name: Fix new known bugs
---

# STATE

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-07-16)

**Core value:** Надёжное выполнение задач с своевременными уведомлениями
**Current focus:** Phase 03.1 — выполнены 4/4 плана, автоматическая верификация завершена; ожидаются пять проверок на устройстве.

## Progress

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1     | Awaiting verification | 3/3   | Executed |
| 2     | ✓ Complete | 4/4   | 100%     |
| 3     | ✓ Complete | 3/3   | 100%     |
| 03.1  | Human verification needed | 4/4   | Код и автоматические проверки завершены |
| 4     | Planned (после UAT и корректировки планов) | 0/3   | Planned  |

## Next Actions

1. Провести пять проверок `03.1-UAT.md` на устройстве через `$gsd-verify-work 03.1`. До их результата фаза не отмечается завершённой.
2. Исправить прежний CR-05 (потеря черновика при отказе хранилища) отдельной задачей; disposition и ограничения описаны в `03.1-REVIEW-DISPOSITION.md`.
3. Перед Phase 4 перепланировать 04-02 и 04-03: изменена работа с датами, удалены `getEffectiveReminderDate` и `adjustedDate`, добавлены `getTodo`/`patchTodo`. Старый тест переноса на +60 секунд больше не соответствует D-04.
4. После приёмки и корректировки планов выполнить Phase 4 (Testing) — `$gsd-execute-phase 4`.

---

*Обновлено: 2026-11-21 после автоматической верификации Phase 03.1.*

## Session

**Last session:** 2026-10-24T07:20:58.276Z
**Stopped at:** Phase 03.1 awaits native UAT (human_needed)
**Resume file:** .planning/phases/03.1-fix-new-known-bugs/03.1-UAT.md

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
