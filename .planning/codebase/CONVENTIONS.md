---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
# Соглашения по коду

**Дата анализа:** 2026-10-24

## Naming Patterns

**Файлы:**
- React-компоненты: PascalCase, по одному компоненту на папку: `components/Todo/Todo.tsx`, `components/AddTodo/AddTodo.tsx`, `components/WeekStrip/WeekStrip.tsx`
- Стили каждого компонента лежат рядом в `components/<Name>/styles.ts`
- Хуки: camelCase с префиксом `use`: `hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `hooks/useNotifications.ts`
- Утилиты и модули: camelCase: `utils/recurrence.ts`, `utils/time.ts`, `utils/todoFilters.ts`, `storage/todoStorage.ts`
- Типы: `types/todo.ts`; константы: `constants/todo.ts`; тема: `themes/colors.ts`
- Корень: `App.tsx` (компонент), `index.ts` (точка входа Expo), `styles.ts` (общие стили экрана)

**Функции:**
- camelCase, глаголы в начале: `loadTodos`, `saveTodos`, `addTodo`, `nextRecurrenceDate`, `filterDisplayedTodos`
- Обработчики событий в компонентах: префикс `on` для пропсов и локальных обработчиков (`onAddTodo`, `onUpdateTodo`, `onPrevDate`, `onTaskComplete`, `onTaskDelete`), префикс `open`/`close`/`show` для UI-действий (`openEditModal`, `closeModal`, `showDeleteAlert`)
- Компоненты экспортируются как `export default function Name(...)`: `components/Todo/Todo.tsx`, `components/Header/Header.tsx`
- Хуки и утилиты - именованные экспорты: `export function useTodos()` (`hooks/useTodos.ts`), `export const isExpired = ...` (`utils/todoFilters.ts`)
- Функции-предикаты: префикс `is`/`isValid`: `isExpired`, `isFuture`, `isValidSize`, `isValidRepeatFrequency`

**Переменные и состояние:**
- camelCase: `selectedDate`, `showAddModal`, `prevDateLoading`
- Пары состояния: `[value, setValue]` (`const [showAll, setShowAll] = useState(false)`)
- Константы модуля: UPPER_SNAKE_CASE для строковых ключей и списков: `TODOS_KEY` (`storage/todoStorage.ts`), `DAYS` (`components/WeekStrip/WeekStrip.tsx`)
- Объекты-таблицы значений: camelCase: `colors`, `spacing`, `radius`, `shadows`, `sizes`, `sizeOptions`

**Типы:**
- `type` (а не `interface`) для доменных моделей и пропсов: `TodoItem`, `SizeItem`, `SizeOption`, `TodoProps`, `AddTodoProps` (`types/todo.ts`, `components/Todo/Todo.tsx`)
- `interface` допускается для пропсов отдельных компонентов: `HeaderProps`, `WeekStripProps` (`components/Header/Header.tsx`, `components/WeekStrip/WeekStrip.tsx`) - смешивание допустимо, но для новых компонентов рекомендуется `type`
- Литеральные union-типы для ограниченных значений: `export type Size = 1 | 3 | 5 | 8 | 13` (`types/todo.ts`)

## Code Style

**Форматирование:**
- Инструмент форматирования (Prettier, Biome) не настроен: конфиг `.prettierrc` и `biome.json` отсутствуют
- Фактический стиль непоследователен:
  - `App.tsx`, `components/AddTodo/AddTodo.tsx`, `components/Todo/Todo.tsx`, `hooks/*` - двойные кавычки, точка с запятой, отступ 2 пробела (в `App.tsx`, `hooks/`) или 4 пробела (в `components/Todo/Todo.tsx`, `components/AddTodo/AddTodo.tsx`, `utils/recurrence.ts`, `types/todo.ts`)
  - `components/EmptyState/EmptyState.tsx`, `components/Todo/styles.ts`, `components/AddTodo/styles.ts` - одинарные кавычки в импортах (`'react-native'`) и в части строк
  - `themes/colors.ts` и `constants/todo.ts` - отступ 2 или 4 пробела в одном файле
- Для новых файлов придерживаться стиля соседнего файла в той же папке; в новых модулях предпочтительно: двойные кавычки, точка с запятой, отступ 2 пробела (как в `hooks/` и `utils/todoFilters.ts`)
- Длинные вызовы разбиваются на несколько строк с завершающей запятой в аргументах (`hooks/useTodos.ts`, `hooks/useTodoFilters.ts`)

**Линтинг:**
- ESLint и TypeScript-линтер не настроены (нет `.eslintrc*`, `eslint.config.*`)
- Единственная статическая проверка - компилятор TypeScript в строгом режиме (см. `tsconfig.json`: `"strict": true`, база `expo/tsconfig.base`)
- Проверка типов выполняется вручную: `npx tsc --noEmit`

**Стили (StyleSheet):**
- Стили создаются через `StyleSheet.create` в файлах `styles.ts`, объекты стилей именуются по элементу: `card`, `header`, `titleRow`, `checkbox`, `deleteButton` (`components/Todo/styles.ts`)
- Значения берутся из токенов темы: `colors.*`, `spacing.*`, `radius.*`, `shadows.*` из `themes/colors.ts`. Использовать жёсткие значения цветов в новых стилях не рекомендуется, однако в проекте они встречаются (`components/Todo/Todo.tsx`: `"#92400e"`, `"#02c72c"` в `constants/todo.ts`, `styles.ts`: `"#ffffff8f"`)
- Условные стили - массивом: `style={[styles.dayPill, isActive && styles.dayPillActive]}` (`components/WeekStrip/WeekStrip.tsx`)
- Динамические значения (цвет по размеру задачи) передаются inline: `style={[styles.card, { borderLeftColor: sizes[todo.size].color }]}` (`components/Todo/Todo.tsx`)

## Import Organization

**Порядок (фактический, в основном):**
1. Встроенные модули React и React Native: `import { useState } from "react"`, `import { View, Text } from "react-native"`
2. Сторонние библиотеки: `date-fns`, `expo-*`, `lucide-react-native`, `yandex-mobile-ads`, `react-native-safe-area-context`
3. Внутренние компоненты и хуки (относительные пути)
4. Типы, константы, темы, стили: `import { TodoItem } from "../../types/todo"`, `import { styles } from "./styles"`

Порядок не закреплён инструментом, поэтому отклонения допустимы. Импорты типов обычно идут обычными `import`, без `import type`.

**Пути:**
- Path aliases не настроены: везде относительные пути (`../../themes/colors`, `./styles`)
- Barrel-файлы (`index.ts` с реэкспортами) в папках не используются

**Именованные vs default-экспорты:**
- Компоненты - `export default` (`components/*/*.tsx`)
- Хуки, утилиты, константы, типы - именованные экспорты
- Импорт компонентов: `import Todo from "./components/Todo/Todo";`

## Error Handling

**Асинхронные операции с хранилищем (`storage/todoStorage.ts`):**
- Функции `saveTodos` и `loadTodos` оборачивают вызов AsyncStorage в `try/catch` и пробрасывают ошибку дальше (`throw error`), без преобразования
- Функции высокого уровня (`addTodo`, `removeTodo`, `updateTodo`) не обрабатывают ошибки, а полагаются на вызывающий код

**Обработка в UI и хуках:**
- Ошибки для пользователя показываются через `Alert.alert("Ошибка", "<текст на русском>")`: `hooks/useTodos.ts` (загрузка, создание, обновление), `components/Todo/Todo.tsx`
- Ошибки второстепенных операций (реклама, нотификации) пишутся в лог через `console.log` и не показываются пользователю: `App.tsx` (`MobileAds.initialize`, `BannerAdSize.stickySize`)
- В `hooks/useNotifications.ts` блок `try { ... } catch (e) { throw e; }` не добавляет логики и может быть упрощён
- Ошибки при установке уведомлений в `hooks/useTodos.ts` перехватываются, но задача всё равно сохраняется без `notificationId`

**Защита от «неподписанных» обновлений:**
- В эффектах с асинхронной загрузкой используется флаг `let mounted = true` и проверка перед `setState`, cleanup возвращает `mounted = false` (`hooks/useTodos.ts`, `App.tsx`)

**Валидация пользовательского ввода:**
- Валидация выполняется в обработчике сохранения `onCreate` в `components/AddTodo/AddTodo.tsx`: ранний `return` после `setError({...error, <поле>: "<сообщение>"})`
- Порядок проверок: название, частота повторения, дата не в прошлом, корректная частота (`isValidRepeatFrequency`), корректный размер (`isValidSize`)
- Допустимые значения и проверки вынесены в `constants/todo.ts` (`isValidSize`, `isValidRepeatFrequency`)

## Logging

**Фреймворк:** встроенный `console` (отдельной библиотеки логирования нет)

**Паттерны:**
- Информационные сообщения на русском: `console.log("Уведомление получено:", notification)` (`hooks/useNotifications.ts`)
- Предупреждения: `console.warn("Уведомления работают только на реальном устройстве")`
- Пользовательские ошибки - через `Alert`, а не через лог
- В проекте около 14 вызовов `console.*`, `Alert.alert` и `alert` в `App.tsx`, `components/`, `hooks/`, `utils/`, `storage/`; вызовы `console.log` с отладочными данными (полные объекты уведомлений) не удалять без необходимости, но и не расширять

## Comments

**Когда комментировать:**
- Комментарии пишутся на русском языке (см. `CLAUDE.md`)
- Комментарии объясняют причину решения, а не пересказывают код: `// Пустой массив зависимостей: инициализация SDK должна выполняться один раз при монтировании, а не на каждый рендер` (`App.tsx`)
- Комментарии-пометки о назначении эффектов: `// Синхронный эффект (только setState) — cleanup не требуется` (`App.tsx`)
- Блоки-разделители в сохранении: `// 💾 SAVE` (`components/AddTodo/AddTodo.tsx`) - допустимы, но не обязательны
- Ссылки на файлы документации и отладки в комментариях: `.planning/debug/recurring-notification-stops-after-complete.md` (`utils/recurrence.ts`)

**JSDoc/TSDoc:**
- Используется в ключевых утилитах с описанием контракта, на русском: `utils/recurrence.ts` (`nextRecurrenceDate`, `nextReminderIso`)
- Для остальных функций JSDoc не применяется

## Function Design

**Размер:**
- Утилиты короткие (5-20 строк): `utils/time.ts`, `utils/recurrence.ts`
- Компоненты крупные: `components/AddTodo/AddTodo.tsx` (425 строк), `components/Todo/Todo.tsx` (260 строк). При добавлении логики выносить обработчики и вычисления в хуки или `utils/`

**Параметры:**
- Позиционные параметры для утилит: `nextRecurrenceDate(base: Date, repeatFrequency: number)`
- Пропсы компонентов - объект с типизированным `type XxxProps = {...}`, деструктуризация в сигнатуре
- Необязательные параметры с значением по умолчанию через сигнатуру: `now: Date = new Date()` (`utils/todoFilters.ts`), `editData = null` (`components/AddTodo/AddTodo.tsx`)

**Возвращаемые значения:**
- Сложные результаты - объекты: `{ notificationId, adjustedDate }` (`hooks/useNotifications.ts`), `{ allTodos, getAllTodos, onAddTodo, onUpdateTodo }` (`hooks/useTodos.ts`)
- Обработчики асинхронных операций возвращают `Promise<void>`
- Стрелочные функции для утилит и обработчиков в компонентах, `function`-объявления для компонентов и хуков

## Module Design

**Экспорт:**
- Компонент - `export default`; вспомогательные функции и типы - именованные
- Типы хранятся в `types/`, а не рядом с компонентами (исключение - пропсы)

**Файловая организация:**
- Одна папка на компонент: `components/<Name>/<Name>.tsx` + `styles.ts`
- Бизнес-логика вычислений - в `utils/`, побочные эффекты (хранилище, уведомления) - в `storage/` и `hooks/`
- Компоненты не обращаются к AsyncStorage напрямую через хук - исключение: `components/Todo/Todo.tsx` импортирует `removeTodo`, `updateTodo` из `storage/todoStorage.ts` и `rescheduleNextNotification` из `hooks/useNotifications.ts`

**Barrel-файлы:** не используются

**Хуки React:**
- `useMemo` применяется для производных списков: `hooks/useTodoFilters.ts`
- `useCallback` применяется для обработчиков, передаваемых в дочерние компоненты: `App.tsx` (`changeDate`, `selectDate`)
- В компонентах `Todo`, `AddTodo`, `Header` мемоизация не используется

---

*Соглашения: 2026-10-24*
