---
phase: 4
slug: 4-testing
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Источник: `04-RESEARCH.md` § Validation Architecture. Значения `Task ID` в карте
> ниже проставляются на этапе `validate-phase` после создания планов.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (`jest@^29.7.0`) + preset `jest-expo@^54.0.17` + RNTL `@testing-library/react-native@^14` |
| **Config file** | `package.json` → ключ `"jest": { "preset": "jest-expo" }` (создаётся в Wave 0 этой фазы) |
| **Quick run command** | `npx jest <path>.test.ts -x` |
| **Full suite command** | `npm test` (маппится на `jest`, единичный non-watch прогон) |
| **Estimated runtime** | ~10–20 секунд (набор из ~5 unit/integration файлов) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest <соответствующий файл>.test.ts -x`
- **After every plan wave:** Run `npm test` (полный набор)
- **Before `/gsd-verify-work`:** Full suite зелёный (exit code 0, все `describe`/`test` passed)
- **Max feedback latency:** ~20 секунд

---

## Per-Task Verification Map

> Task ID проставляется на этапе `validate-phase` (планы создаются после этого файла).
> Карта ниже — requirement-level; каждый Req покрывается отдельным тест-файлом.

| Task ID | Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|-------------|----------|-----------|-------------------|-------------|--------|
| TBD | TEST-01 | `isExpired`/`isToday`/`isFuture` (граница дня), `sortByDate`, `filterDisplayedTodos` | unit | `npx jest utils/todoFilters.test.ts -x` | ❌ W0 | ⬜ pending |
| TBD | TEST-01 | `parseTime` (валид/невалид → `null`), `formatTime` (паддинг нулями) | unit | `npx jest utils/time.test.ts -x` | ❌ W0 | ⬜ pending |
| TBD | TEST-02 | `nextRecurrenceDate` — сдвиг ровно на `repeatFrequency` (не дважды); `nextReminderIso` | unit | `npx jest utils/recurrence.test.ts -x` | ❌ W0 | ⬜ pending |
| TBD | TEST-03 | `getEffectiveReminderDate` (прошлое → now+60s), `rescheduleNextNotification` (единственный сдвиг), `scheduleNotification`/`cancelNotification` | unit + `jest.mock("expo-notifications")` | `npx jest hooks/useNotifications.test.ts -x` | ❌ W0 | ⬜ pending |
| TBD | TEST-04 | round-trip `saveTodos`/`loadTodos`, пустой storage → `[]`, битый JSON → проброс ошибки (BUGF-02), `addTodo`/`removeTodo`/`updateTodo` | integration + official AsyncStorage in-memory mock | `npx jest storage/todoStorage.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — добавить devDependencies (`jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native`), ключ `"jest": { "preset": "jest-expo" }`, скрипты `test`/`test:watch`
- [ ] `tsconfig.json` — добавить `"types": ["jest"]`
- [ ] `utils/todoFilters.test.ts` — заглушки для TEST-01
- [ ] `utils/time.test.ts` — заглушки для TEST-01
- [ ] `utils/recurrence.test.ts` — заглушки для TEST-02 (+ регрессия двойного сдвига)
- [ ] `hooks/useNotifications.test.ts` — заглушки для TEST-03 (+ `jest.mock` для `expo-notifications`/`expo-device`)
- [ ] `storage/todoStorage.test.ts` — заглушки для TEST-04 (+ official AsyncStorage mock)

*Фикстуры (`makeTodo`) — co-located в каждом файле; общий `jest.setup.js` не требуется (см. RESEARCH Open Question 2).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| — | — | — | — |

*All phase behaviors have automated verification (фаза целиком про автотесты).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags (`test:watch` — только ручной, не в CI-пути)
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
