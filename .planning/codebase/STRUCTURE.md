---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
# Структура кодовой базы

**Analysis Date:** 2026-10-24

## Дерево каталогов

```
wellWell/
├── App.tsx                  # Корневой компонент экрана
├── index.ts                 # Точка входа Expo (registerRootComponent)
├── styles.ts                # Общие стили экрана App
├── app.json                 # Конфигурация Expo (имя, пакет Android, плагины)
├── eas.json                 # Профили сборки EAS
├── package.json             # Зависимости и npm-скрипты
├── tsconfig.json            # TypeScript (strict, наследует expo/tsconfig.base)
├── CLAUDE.md                # Языковые правила проекта
├── assets/                  # Иконки и сплэш
├── components/              # UI-компоненты, по папке на компонент
│   ├── AddTodo/             # Модалка создания/редактирования задачи
│   ├── EmptyState/          # Заглушка пустого списка
│   ├── Header/              # Заголовок с датой и кнопками
│   ├── Todo/                # Карточка задачи
│   └── WeekStrip/           # Полоса дней недели
├── hooks/                   # Кастомные React-хуки
├── storage/                 # Работа с AsyncStorage
├── utils/                   # Чистые функции дат и фильтров
├── types/                   # Типы TypeScript
├── constants/               # Константы и валидаторы
└── themes/                  # Палитра, тени, отступы
```

Служебные каталоги, которые не относятся к коду приложения: `node_modules/`, `.git/`, `.claude/`, `.kilo/`, `.planning/`, `.expo/`. Каталоги `android/` и `ios/` в репозитории не обнаружены (сборка идёт через EAS / prebuild).

## Назначение каталогов

**`components/`:**
- Назначение: презентационные компоненты и их локальная логика.
- Содержит: `<Name>.tsx` и `styles.ts` в одной папке.
- Ключевые файлы: `components/Todo/Todo.tsx` (обработка выполнения и удаления), `components/AddTodo/AddTodo.tsx` (форма, 425 строк).

**`hooks/`:**
- Назначение: состояние и сайд-эффекты.
- Содержит: `useTodos.ts`, `useTodoFilters.ts`, `useNotifications.ts`.
- Ключевые файлы: `hooks/useTodos.ts` (основной хук данных).

**`storage/`:**
- Назначение: единственная обёртка над `AsyncStorage`.
- Содержит: `todoStorage.ts`.

**`utils/`:**
- Назначение: чистые функции без React.
- Содержит: `todoFilters.ts`, `recurrence.ts`, `time.ts`.

**`types/`:**
- Назначение: общие типы.
- Содержит: `todo.ts` (`TodoItem`, `Size`, `SizeItem`, `SizeOption`).

**`constants/`:**
- Назначение: справочники и валидаторы.
- Содержит: `todo.ts` (`sizes`, `sizeOptions`, `isValidSize`, `isValidRepeatFrequency`).

**`themes/`:**
- Назначение: дизайн-токены.
- Содержит: `colors.ts` (`colors`, `shadows`, `spacing`, `radius`).

**`assets/`:**
- Назначение: статические изображения.
- Содержит: `icon.png`, `splash-icon.png`.

## Ключевые места в коде

**Точки входа:**
- `index.ts`: регистрация корневого компонента.
- `App.tsx`: корневой экран.

**Конфигурация:**
- `app.json`: идентификатор Android-пакета `com.natalielinen.wellWell`, версия `1.2.0`, разрешения `NOTIFICATIONS` и `SCHEDULE_EXACT_ALARM`, `newArchEnabled: true`.
- `eas.json`: профили `development`, `preview`, `production`.
- `tsconfig.json`: `strict: true`.

**Основная логика:**
- `hooks/useTodos.ts`: загрузка, добавление, обновление задач.
- `utils/todoFilters.ts`: выборка задач на дату.
- `utils/recurrence.ts`: расчёт следующего выполнения.
- `hooks/useNotifications.ts`: уведомления.

**Тесты:**
- Тестовых файлов и конфигурации тестового раннера в репозитории не обнаружено.

## Соглашения об именовании

**Файлы:**
- React-компоненты: PascalCase, `components/<Name>/<Name>.tsx` (например, `components/WeekStrip/WeekStrip.tsx`).
- Хуки: camelCase с префиксом `use`, `hooks/use<Name>.ts` (например, `hooks/useTodoFilters.ts`).
- Модули утилит, хранилища, типов и констант: camelCase, например `utils/todoFilters.ts`, `storage/todoStorage.ts`, `constants/todo.ts`.
- Стили: всегда `styles.ts` внутри папки компонента, либо корневой `styles.ts` для экрана.

**Директории:**
- Компоненты: PascalCase, по одной папке на компонент (`components/AddTodo/`).
- Остальные каталоги: lowercase, в единственном числе для типов и констант (`type`, `constant`), во множественном для групп модулей (`hooks/`, `utils/`, `components/`), кроме `storage/` и `themes/`.

**Экспорты:**
- Компоненты — `export default function <Name>()`.
- Хуки и утилиты — именованные экспорты (`export function useTodos`, `export const isExpired`).
- Смешение стилей: часть файлов использует двойные кавычки, часть одинарные (`themes/colors.ts`, `components/EmptyState/EmptyState.tsx`). Новый код следует ориентироваться на соседние файлы папки.

## Где добавлять новый код

**Новая фича на главном экране:**
- Компонент: `components/<FeatureName>/<FeatureName>.tsx` и `components/<FeatureName>/styles.ts`.
- Подключение: `App.tsx` (рендер) и при необходимости состояние в `hooks/`.

**Новый хук данных:**
- Реализация: `hooks/use<Name>.ts`.
- Работа с хранилищем: добавлять функции в `storage/todoStorage.ts`, а не в хук напрямую.

**Новая операция с задачами (удаление, выполнение, перенос):**
- Хранение: `storage/todoStorage.ts`.
- Оркестрация состояния: `hooks/useTodos.ts` (рекомендуется, см. антипаттерн в ARCHITECTURE.md).

**Новая утилита или правило вычисления дат:**
- Реализация: `utils/<name>.ts`, чистые функции с параметром `now: Date = new Date()`, как в `utils/todoFilters.ts`.

**Новые типы и константы:**
- Типы: `types/<domain>.ts`.
- Справочники и валидаторы: `constants/<domain>.ts`.

**Новые цвета, отступы, тени:**
- `themes/colors.ts`. Не использовать литеральные цвета в компонентах; исключение — цвета статуса в `constants/todo.ts` (`sizes`).

**Новые тесты (при появлении раннера):**
- Рекомендуемое место: рядом с модулем в `utils/` или в каталоге `__tests__/` в корне.

**Новая модалка или экран:**
- Текущая архитектура не содержит навигатора. Модалки реализуются через `showAddModal`-подобное состояние в `App.tsx` и компонент с пропсом `showModal`, как `components/AddTodo/AddTodo.tsx`.

## Специальные каталоги

**`.expo/`:**
- Назначение: кэш и служебные файлы Expo CLI.
- Генерируется: да.
- Коммитится: нет (см. `.gitignore`).

**`node_modules/`:**
- Назначение: установленные npm-пакеты.
- Генерируется: да (`npm install`).
- Коммитится: нет.

**`.planning/`:**
- Назначение: документы GSD (PROJECT.md, ROADMAP.md, STATE.md, фазы, отладка, каталог `codebase/`).
- Генерируется: частично (GSD-инструментами).
- Коммитится: да.

**`.claude/`, `.kilo/`:**
- Назначение: настройки и агенты инструментов разработки, не относятся к приложению.
- Коммитится: да.

---

*Structure analysis: 2026-10-24*
