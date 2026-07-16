# Архитектура

*Последнее обновление: 2026-07-16*

## Паттерн

**Monolith SPA с контейнерным компонентом.** Один главный компонент `App.tsx` держит всё состояние приложения и передаёт его вниз через props. Без state management библиотек, без роутинга, без серверного взаимодействия.

## Слои

| Слой | Файлы | Ответственность |
|------|-------|-----------------|
| Presentation | `App.tsx`, `components/**/*.tsx` | UI, пользовательские взаимодействия |
| Logic (inline) | `App.tsx` callbacks | Бизнес-логика фильтрации, сортировки, навигации по датам |
| Storage | `storage/todoStorage.ts` | Асинхронное CRUD поверх AsyncStorage |
| Types | `types/todo.ts` | Типы данных: `TodoItem`, `Size`, `SizeItem`, `SizeOption` |
| Constants | `constants/todo.ts` | Конфигурация размеров задач (Fibonacci) |
| Theme | `themes/colors.ts` | Дизайн-токены: цвета, тени, отступы, радиусы |
| Hooks | `hooks/useNotifications.ts` | Переиспользуемая логика уведомлений |

## Поток данных

```
Пользователь взаимодействует с компонентом
        ↓
App.tsx (state holder) вызывает обработчик
        ↓
Хранилище (storage/todoStorage.ts) → AsyncStorage
        ↓
Обновление state → перерендер через FlatList
```

- Все mutations задач проходят через `App.tsx`: `onAddTodo`, `onUpdateTodo`, `getAllTodos`
- Компоненты поднимают события вверх: `Todo` → `openEditModal`, `onTaskComplete`, `onTaskDelete`
- `AddTodo` сообщает о готовности через `onAddTodo` / `onUpdateTodo` callbacks

## Абстракции

- **Theme tokens**: `colors`, `shadows`, `spacing`, `radius` экспортируются из `themes/colors.ts` и импортируются в каждый `styles.ts`
- **TodoItem**: единый тип данных для всех операций с задачами
- **useNotifications**: кастомный хук инкапсулирует всю логику Expo Notifications

## Entry points

| Entry | Путь | Назначение |
|-------|------|------------|
| React Native | `index.ts` | `registerRootComponent(App)` |
| Expo Go / dev | `App.tsx` | Главный компонент |
| EAS build | `app.json` | Конфигурация сборки |

## Компонентная модель

- `App.tsx` — контейнер, содержит все `useState`
- `Header` — навигация по датам, кнопки «Все задачи» и «+»
- `WeekStrip` — выбор дня недели, индикаторы задач точками
- `FlatList` + `Todo` — список задач с пагинацией
- `AddTodo` — модалка создания/редактирования
- `EmptyState` — пустое состояние списка
