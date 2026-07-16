# Технологический стек

*Последнее обновление: 2026-07-16*

## Языки и runtime

- **TypeScript** ~5.9.2 — основной язык с включённым `strict` режимом (`tsconfig.json:4`)
- **JavaScript** — подмножество через TypeScript, no loose mode
- **React Native** 0.81.5 — кроссплатформенный фреймворк (iOS, Android, Web)
- **Expo** ~54.0.34 — тулкит поверх React Native, управление сборкой через EAS

## Фреймворки и библиотеки

| Категория | Библиотека | Версия | Назначение |
|-----------|-----------|--------|------------|
| UI | `react-native` | 0.81.5 | Нативные компоненты |
| UI | `expo` | ~54.0.34 | Фреймворк и тулкит |
| UI | `lucide-react-native` | ^1.14.0 | Иконки |
| UI | `expo-linear-gradient` | ~15.0.8 | Градиенты в хедере |
| UI | `expo-status-bar` | ~3.0.9 | Светлый статус-бар |
| UI | `react-native-safe-area-context` | ^5.6.2 | SafeAreaView |
| State | React hooks | встроено | `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` |
| Dates | `date-fns` | ^4.1.0 | Парсинг, форматирование, арифметика дат |
| Storage | `@react-native-async-storage/async-storage` | 2.2.0 | Локальное ключ-значение хранилище |
| Notifications | `expo-notifications` | ~0.32.17 | Push-уведомления и планировщик |
| Device | `expo-device` | ~8.0.10 | Определение реального устройства |
| Picker | `@react-native-community/datetimepicker` | 8.4.4 | Выбор даты и времени |
| Picker | `@react-native-picker/picker` | 2.11.1 | Select-компонент (возможно не используется напрямую) |
| Ads | `yandex-mobile-ads` | ^8.0.0 | Баннерная реклама |
| Gestures | `react-native-gesture-handler` | ~2.28.0 | Жесты (зависимость Expo) |
| SVG | `react-native-svg` | 15.12.1 | SVG (зависимость Expo) |

## Сборка и деплой

- **EAS Build** (`eas.json`) — три конфигурации: `development` (developmentClient, internal), `preview` (APK, internal), `production` (autoIncrement)
- **EAS Submit** — только `production`
- **CLI** >= 18.5.0, `appVersionSource: local`
- **Android**:
  - Пакет: `com.natalielinen.wellWell`
  - `versionCode: 3`
  - Разрешения: `NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`
  - `edgeToEdgeEnabled: true`
  - `predictiveBackGestureEnabled: false`
  - `softwareKeyboardLayoutMode: pan`
- **iOS**: `supportsTablet: true`

## Конфигурация

- `tsconfig.json` — расширяет `expo/tsconfig.base`, только `strict: true`
- `app.json` — Expo конфиг с плагинами (`expo-notifications` с кастомной иконкой и цветом)
- `.gitignore` — стандартный для Expo/React Native
- Нет `.eslintrc` / `.prettierrc` / `.editorconfig`

## Зависимости

- Все production-зависимости — JavaScript/TypeScript пакеты, нет нативных модулей кроме стандартных React Native
- `node_modules` присутствует, `package-lock.json` зафиксирован

## Entry point

- `index.ts:1` — `registerRootComponent(App)`, стандартный Expo entry point
- `App.tsx:1` — главный компонент приложения
