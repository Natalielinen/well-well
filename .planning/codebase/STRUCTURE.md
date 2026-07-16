# Структура директорий

*Последнее обновление: 2026-07-16*

## Общий вид

```
wellWell/
├── .expo/                  # Кэш Expo
├── .git/
├── .kilo/                  # Конфигурация Kilo/GSD
├── assets/                 # Иконки и сплеш-скрин
│   ├── icon.png
│   └── splash-icon.png
├── components/             # React Native компоненты по фичам
│   ├── AddTodo/
│   │   ├── AddTodo.tsx     # Модалка создания/редактирования задачи
│   │   └── styles.ts       # Стили модалки
│   ├── EmptyState/
│   │   ├── EmptyState.tsx  # Пустое состояние списка
│   │   └── styles.ts       # Стили пустого состояния
│   ├── Header/
│   │   ├── Header.tsx      # Хедер с градиентом и навигацией
│   │   └── styles.ts       # Стили хедера
│   ├── Todo/
│   │   ├── Todo.tsx        # Карточка задачи
│   │   └── styles.ts       # Стили карточки
│   └── WeekStrip/
│       ├── WeekStrip.tsx   # Полоска дней недели
│       └── styles.ts       # Стили полоски
├── constants/              # Константы приложения
│   └── todo.ts             # Размеры задач (Fibonacci), опции селекта
├── hooks/                  # Кастомные React хуки
│   └── useNotifications.ts # Логика push-уведомлений
├── storage/                # Слой persistence
│   └── todoStorage.ts      # AsyncStorage CRUD
├── styles.ts               # Глобальные стили (scroll container, кнопка «вверх»)
├── themes/                 # Дизайн-токены
│   └── colors.ts           # Цвета, тени, отступы, радиусы
├── types/                  # TypeScript типы
│   └── todo.ts             # TodoItem, Size, SizeItem, SizeOption
├── App.tsx                 # Главный компонент (всё состояние здесь)
├── index.ts                # Entry point (registerRootComponent)
├── app.json                # Expo конфигурация
├── eas.json                 # EAS Build/Submit конфигурация
├── package.json            # Зависимости и скрипты
├── tsconfig.json           # TypeScript конфиг
└── CLAUDE.md               # Инструкции для AI-ассистента
```

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `App.tsx` | Главный компонент. Содержит все `useState`, фильтрацию задач, обработку уведомлений, рендеринг. |
| `storage/todoStorage.ts` | Единый источник правды для задач. Асинхронные методы, возвращают массивы задач. |
| `hooks/useNotifications.ts` | Инкапсулирует `expo-notifications`: запрос разрешений, планирование, отмена. |
| `themes/colors.ts` | Дизайн-токены проекта. Импортируется во все `styles.ts`. |
| `types/todo.ts` | Доменная модель. `TodoItem` — основная сущность. |

## Соглашения по именованию

- Компоненты: `PascalCase.tsx` (например, `AddTodo.tsx`)
- Стили компонентов: `styles.ts` в той же директории
- Хуки: `use` префикс (например, `useNotifications.ts`)
- Типы: `PascalCase` с суффиксом типа (например, `TodoItem`)
- Константы: `camelCase` (например, `sizes`, `sizeOptions`)
- Утилиты/хранилище: `camelCase.ts` (например, `todoStorage.ts`)
