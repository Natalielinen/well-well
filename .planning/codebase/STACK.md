---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
# Технологический стек

**Analysis Date:** 2026-10-24

## Языки

**Основной:**
- TypeScript `~5.9.2` - весь исходный код приложения: `App.tsx`, `index.ts`, `components/`, `hooks/`, `utils/`, `storage/`, `types/`, `constants/`, `themes/`, `styles.ts`
- Конфигурация TypeScript: `tsconfig.json` (наследует `expo/tsconfig.base`, включён `strict: true`)

**Вторичный:**
- JSON - конфигурация Expo и EAS: `app.json`, `eas.json`, `package.json`

## Среда выполнения

**Окружение:**
- React Native `0.81.5` с включённой новой архитектурой (`newArchEnabled: true` в `app.json`)
- Expo SDK `~54.0.34` (точка входа через `expo/AppEntry`-совместимый `registerRootComponent` в `index.ts`)
- Целевые платформы: Android (основная, пакет `com.natalielinen.wellWell`), iOS (`supportsTablet: true`), web (только для `expo start --web`, favicon настроен в `app.json`)
- Ориентация: только портрет (`orientation: "portrait"`), светлая тема (`userInterfaceStyle: "light"`)

**Пакетный менеджер:**
- npm (lockfile `package-lock.json` присутствует, около 806 записей `node_modules/`)
- Совместимость с Yarn/pnpm не настроена (lockfile другого менеджера отсутствует)

## Фреймворки

**Основной:**
- React `19.1.0` - UI-слой, хуки (`hooks/useTodos.ts`, `hooks/useTodoFilters.ts`, `hooks/useNotifications.ts`)
- React Native `0.81.5` - нативные компоненты, `StyleSheet` (`components/*/styles.ts`, `styles.ts`)
- Expo `~54.0.34` - сборка, dev-сервер, модули SDK

**Тестирование:**
- Не обнаружено. Нет тестовых фреймворков (Jest, Vitest, Jest-Expo) в `package.json` и нет тестовых файлов.

**Сборка / разработка:**
- Expo CLI - скрипты `start`, `android`, `ios`, `web` в `package.json`
- EAS Build - профили `development`, `preview`, `production` в `eas.json` (`production` с `autoIncrement: true`, `preview` собирает APK для внутреннего распространения)
- `@types/react` `~19.1.0` - типы React (devDependency)

## Ключевые зависимости

**Критичные (функциональность приложения):**
- `expo-notifications` `~0.32.17` - локальные напоминания о задачах, каналы Android, обработчик уведомлений (`hooks/useNotifications.ts`)
- `expo-device` `~8.0.10` - проверка `Device.isDevice` перед запросом разрешений на уведомления
- `@react-native-async-storage/async-storage` `2.2.0` - локальное хранилище задач (`storage/todoStorage.ts`, ключ `TODOS`)
- `@react-native-community/datetimepicker` `8.4.4` - выбор даты и времени в форме задачи (`components/AddTodo/AddTodo.tsx`)
- `yandex-mobile-ads` `^8.0.0` - баннерная реклама Yandex (`App.tsx`: `MobileAds.initialize()`, `BannerView`)
- `date-fns` `^4.1.0` - работа с датами: `format`, `parse`, `isBefore`, `addDays`, локаль `ru` (`utils/recurrence.ts`, `utils/todoFilters.ts`, `components/Todo/Todo.tsx`)

**UI и графика:**
- `lucide-react-native` `^1.14.0` - иконки (`ChevronLeft`, `ChevronRight`, `Menu`, `Plus` в `components/Header/Header.tsx`)
- `react-native-svg` `15.12.1` - SVG (зависимость, явного использования в исходниках не обнаружено)
- `expo-linear-gradient` `~15.0.8` - градиент шапки (`components/Header/Header.tsx`)
- `react-native-gesture-handler` `~2.28.0` - жесты (зависимость, явного использования в исходниках не обнаружено)
- `react-native-safe-area-context` `^5.6.2` - `SafeAreaView` в `App.tsx`

**Инфраструктура:**
- `expo-constants` `~18.0.13` - зависимость Expo; в исходниках приложения не импортируется напрямую
- `expo-status-bar` `~3.0.9` - `StatusBar` в `App.tsx`
- `@react-native-picker/picker` `2.11.1` - зависимость; в исходниках приложения не импортируется напрямую

## Конфигурация

**Окружение:**
- Отдельных переменных окружения (`.env`) для исходного кода не обнаружено. Файлов `.env*` в корне проекта нет.
- Идентификаторы сервисов захардкожены в коде:
  - EAS project ID в `app.json` -> `extra.eas.projectId`
  - Yandex Ad Unit ID `R-M-19204363-1` в `App.tsx` (проп `adUnitId` у `BannerView`)
  - Android package `com.natalielinen.wellWell` в `app.json` -> `android.package`
- Разрешения Android объявлены в `app.json` -> `android.permissions`: `NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`
- Плагины Expo в `app.json` -> `plugins`: `@react-native-community/datetimepicker`, `expo-notifications` (иконка и цвет уведомлений)
- Android: `edgeToEdgeEnabled: true`, `softwareKeyboardLayoutMode: "pan"`, `predictiveBackGestureEnabled: false`, `versionCode: 3`

**Сборка:**
- `app.json` - конфигурация Expo, версия `1.2.0`
- `eas.json` - профили сборки EAS (`development`, `preview`, `production`), `cli.version >= 18.5.0`, `appVersionSource: "local"`
- `tsconfig.json` - TypeScript, `strict: true`
- `index.ts` - регистрация корневого компонента `App`
- `.gitignore` - исключения из git

## Требования к платформе

**Для разработки:**
- Node.js и npm (совместимые с Expo SDK 54)
- Expo CLI через `npx expo` или скрипты `npm run start|android|ios|web`
- Для уведомлений нужно реальное устройство: `hooks/useNotifications.ts` выводит предупреждение на эмуляторе
- Для сборки через EAS нужен аккаунт Expo и проект с `projectId` из `app.json`

**Для продакшена:**
- Android: APK (профиль `preview`) или AAB (профиль `production`), распространение через EAS Build / Google Play (`submit.production` в `eas.json`)
- iOS: поддерживается по конфигурации Expo, но в `eas.json` отдельных iOS-настроек нет

---

*Stack analysis: 2026-10-24*
