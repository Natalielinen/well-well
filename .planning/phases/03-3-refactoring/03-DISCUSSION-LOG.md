# Phase 3: 3-refactoring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-25
**Phase:** 03-3-refactoring
**Areas discussed:** Дробление App.tsx, Предикаты дат и фильтрация, Упрощение onTaskComplete, Границы поведения

---

## Дробление App.tsx (REF-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Кастомные хуки | `useTodos` (state + CRUD + загрузка) и `useTodoFilters` (фильтрация/сортировка/предикаты дат). Минимальное изменение, без новых библиотек. | ✓ |
| useReducer | Централизовать переходы состояния в reducer. Больше бойлерплейта. | |
| Context API | Вынести состояние в TodoContext/Provider. Дерево компонентов сейчас неглубокое. | |

**User's choice:** Кастомные хуки
**Notes:** Согласуется с существующим `useNotifications`; проект без state-management библиотек.

---

## Предикаты дат и фильтрация

| Option | Description | Selected |
|--------|-------------|----------|
| Чистые утилиты | Модуль `utils/todoFilters.ts` с чистыми функциями; хук `useTodoFilters` их вызывает. Идеально для unit-тестов Phase 4. | ✓ |
| Внутри хука | Держать логику внутри `useTodoFilters` без отдельного модуля. Сложнее тестировать. | |

**User's choice:** Чистые утилиты
**Notes:** Прямое покрытие unit-тестами TEST-01 без `renderHook`; прецедент `utils/time.ts`.

---

## Упрощение onTaskComplete (REF-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Утилита recurrence | Вынести вычисление следующей даты/reminder в `utils/recurrence.ts`; обе ветки и `showAlertForExpiredTask` используют её. Снижает риск бага двойного сдвига. | ✓ |
| Только дедупликация | Убрать дублирование внутри `Todo.tsx` без нового модуля. | |

**User's choice:** Утилита recurrence
**Notes:** Единый источник правды для логики повторения; связано с недавним багом двойного сдвига `repeatFrequency`.

---

## Границы поведения

| Option | Description | Selected |
|--------|-------------|----------|
| Behavior-preserving + REF-03 | Не менять UX/поведение, кроме требуемого REF-03 (cleanup + обработка ошибок в useEffect). | ✓ |
| Разрешить попутные фиксы | Заодно чинить известные проблемы useEffect. Шире diff. | |

**User's choice:** Behavior-preserving + REF-03
**Notes:** Сохранение поведения делает тесты Phase 4 валидной регрессионной сетью. Точечные фиксы, необходимые для корректного cleanup/ошибок (напр. массив зависимостей для `MobileAds.initialize`), входят в REF-03.

## Claude's Discretion

- Точные имена/сигнатуры хуков и утилит, внутренняя декомпозиция.
- Мемоизация (`useMemo`/`useCallback`) при выносе логики.
- Форма чистых функций в `recurrence.ts`.

## Deferred Ideas

- Оптимизации производительности `FlatList`/списка (инкрементальное обновление, `extraData`) — отдельная фаза/бэклог.
- Унификация форматов дат в хранилище — отдельное решение вне Phase 3.
