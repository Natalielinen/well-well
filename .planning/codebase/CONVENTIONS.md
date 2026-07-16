# Соглашения по коду

*Последнее обновление: 2026-07-16*

## Стиль кода

- **TypeScript strict mode** включён (`tsconfig.json:4`)
- Все файлы используют **двойные кавычки** для импортов и строк
- React компоненты используют **функциональный стиль** с hooks, нет классовых компонентов
- Импорты React всегда явные: `import React, { ... } from "react"`
- `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` — только именованный импорт

## Именование

| Объект | Соглашение | Пример |
|--------|-----------|--------|
| Компоненты | `PascalCase.tsx` | `Todo.tsx`, `AddTodo.tsx` |
| Хуки | `use` + `PascalCase.ts` | `useNotifications.ts` |
| Типы | `PascalCase` + суффикс типа | `TodoItem`, `SizeOption` |
| Функции/переменные | `camelCase` | `changeDate`, `isExpired` |
| Константы | `UPPER_SNAKE_CASE` (редко) | В основном `camelCase` |
| Файлы стилей | `styles.ts` | в директории компонента |

## Паттерны

### Компоненты
- **Container pattern**: `App.tsx` держит состояние, дочерние компоненты получают данные и callbacks через props
- **Callback pattern**: Используется `useCallback` для оптимизации (`App.tsx:55`, `App.tsx:69`)
- **Memoization**: `useMemo` для фильтрации/сортировки задач (`App.tsx:101`)

### Стилизация
- **StyleSheet.create** во всех `styles.ts` файлах
- Дизайн-токены импортируются из `themes/colors.ts`: `colors`, `shadows`, `spacing`, `radius`
- Никаких inline-стилей кроме динамических (`borderLeftColor` на `sizes[todo.size].color`)

### Работа с датами
- `date-fns` используется везде: `format`, `parse`, `isBefore`, `isAfter`, `isSameDay`, `startOfDay`, `addDays`
- Локаль `ru` для пользовательского вывода
- Хранимые даты в ISO-формате `yyyy-MM-dd`, reminder в `yyyy-MM-dd HH:mm`

### Обработка ошибок
- В `storage/todoStorage.ts`: `try/catch` с `console.log` — минимальная обработка
- В `hooks/useNotifications.ts`: `try/catch` с `console.error`
- В `App.tsx`: нет явной обработки ошибок при загрузке задач

### TypeScript
- Интерфейсы используются для пропсов (`HeaderProps`, `TodoProps`, `AddTodoProps`, `WeekStripProps`)
- `type` используется для объединений и литеральных типов (`TodoItem`, `Size`)
- Жёсткая типизация полей форм (например, `repeatFrequency: Number(repeatFrequency)`)

## Структура компонентов

Каждый компонент в своей директории:
- `ComponentName.tsx` — логика и JSX
- `styles.ts` — `StyleSheet.create`

Глобальные стили (`styles.ts` в корне) — только для shared layout-ов.

## Нет в проекте

- ESLint / Prettier конфигурации
- Husky / lint-staged
- Commit conventions (Conventional Commits не настроен)
- Absolute imports (`@/components/...`)
