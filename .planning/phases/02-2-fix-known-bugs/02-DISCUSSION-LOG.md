# Phase 2: 2-fix-known-bugs - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-17
**Phase:** 02-2-fix-known-bugs
**Areas discussed:** Общая утилита времени

---

## Общая утилита времени (BUGF-04)

| Option | Description | Selected |
|--------|-------------|----------|
| utils/time.ts | Плоский модуль без React-зависимостей | ✓ |
| constants/todo.ts | Рядом с константами размеров | |
| hooks/useTimeParsing | Хук (избыточен для чистого парсинга) | |

**User's choice:** utils/time.ts
**Notes:** Чистый модуль, согласуется с правилом именования camelCase.ts.

| Option | Description | Selected |
|--------|-------------|----------|
| Только HH:mm | Строгий формат, ошибка -> null/throw | |
| Несколько форматов | Поддержка ISO/dd.MM.yyyy через date-fns | |
| HH:mm + fallback | HH:mm, при ошибке -> текущее время | ✓ |

**User's choice:** HH:mm + fallback
**Notes:** Ограничиваемся HH:mm, но без броска исключения — fallback на текущее время.

| Option | Description | Selected |
|--------|-------------|----------|
| parseTime + formatTime | Две чистые функции | ✓ |
| Только getUpdatedTime | Перенос как есть | |
| parse+format+updateReminder | Парсинг + обновление reminder вместе | |

**User's choice:** parseTime + formatTime
**Notes:** getUpdatedTime не переносится как именованная единица; обе стороны вызывают чистые функции.

---

## the agent's Discretion

- BUGF-01: замена `event: any` на корректный тип — за агентом.
- BUGF-02: способ показа ошибок пользователю и форма обёртки — за агентом (контракт: ошибки не теряются молча).
- BUGF-03: точка применения и стратегия валидации Size/repeatFrequency — за агентом.

## Deferred Ideas

None — discussion stayed within phase scope
