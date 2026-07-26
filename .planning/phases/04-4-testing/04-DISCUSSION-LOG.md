# Phase 4: 4-testing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-25
**Phase:** 04-4-testing
**Areas discussed:** Тест-фреймворк, Объём TEST-02, Мокирование нативных модулей, Объём фазы (coverage/CI)

---

## Тест-фреймворк

| Option | Description | Selected |
|--------|-------------|----------|
| jest-expo + RNTL | Официальный preset jest-expo (SDK 54) + @testing-library/react-native. Стандарт для Expo/RN. | ✓ |
| Голый jest + ts-jest | Меньше зависимостей, но ручная настройка transform для RN/expo. | |
| Vitest | Быстрый, но нестандартен для RN native-модулей. | |

**User's choice:** jest-expo + RNTL
**Notes:** Корректные transform и native-моки из коробки; критично для RN 0.81/React 19.

---

## Объём TEST-02 (логика завершения задачи)

| Option | Description | Selected |
|--------|-------------|----------|
| Чистая утилита | Тесты utils/recurrence.ts (nextRecurrenceDate/nextReminderIso) + защита от бага двойного сдвига. | ✓ |
| Утилита + компонент | Дополнительно ветвление onTaskComplete в Todo.tsx через RNTL с моком Alert. | |

**User's choice:** Чистая утилита
**Notes:** Основная логика вынесена в Phase 3 в чистый модуль; компонентные тесты отложены.

---

## Мокирование нативных модулей (TEST-03/04)

| Option | Description | Selected |
|--------|-------------|----------|
| Официальные/in-memory | AsyncStorage — официальный jest-мок; expo-notifications — jest.mock с фейками. | ✓ |
| Кастомные моки | Ручные __mocks__ под проект. Больше контроля и поддержки. | |

**User's choice:** Официальные/in-memory
**Notes:** Стандартный подход, минимум поддержки.

---

## Объём фазы (coverage/CI)

| Option | Description | Selected |
|--------|-------------|----------|
| Только тесты + npm scripts | test/test:watch скрипты + тесты TEST-01..04. CI/пороги — отдельно. | ✓ |
| + coverage-порог + CI | Заодно настроить порог покрытия и GitHub Actions. | |

**User's choice:** Только тесты + npm scripts
**Notes:** Соответствует v1-цели; coverage/CI и E2E отложены.

## Claude's Discretion

- Структура тест-файлов (`*.test.ts` рядом с модулем vs `__tests__/`).
- Расположение jest-конфига и setup-файлов.
- Конкретный набор edge-case ассертов на модуль.

## Deferred Ideas

- Тесты компонентов через RNTL (ветвление onTaskComplete, рендер, Alert-флоу).
- Пороги покрытия и CI (GitHub Actions).
- E2E (Detox/Appium).
