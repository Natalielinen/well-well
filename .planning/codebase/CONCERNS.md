---
last_mapped_commit: 8f19dd9a3ab6c613d609ae68b30f03213751bae2
last_mapped_at: 2026-10-24
---
# Codebase Concerns

**Analysis Date:** 2026-10-24

## Tech Debt

**Хранение всех задач одним ключом AsyncStorage без транзакций:**
- Issue: Все задачи лежат одним JSON-массивом под ключом `TODOS`. Каждая операция делает цикл «прочитать весь массив → изменить → записать весь массив» без блокировки. Параллельные операции перетирают друг друга (last write wins).
- Files: `storage/todoStorage.ts` (`addTodo`, `removeTodo`, `updateTodo`), `components/Todo/Todo.tsx` (`handleCompleteTask`), `hooks/useTodos.ts` (`onAddTodo`, `onUpdateTodo`)
- Impact: Например, отметка задачи как выполненной и одновременное редактирование другой задачи могут потерять одно из изменений. Масштабирование до сотен задач также замедлит каждую операцию.
- Fix approach: Ввести сериализацию записей (очередь промисов/мьютекс в `storage/todoStorage.ts`) либо хранить каждую задачу отдельным ключом (`todo:<id>`) с индексом. Для больших объёмов рассмотреть SQLite (`expo-sqlite`).

**Отсутствие версионирования схемы и миграций данных:**
- Issue: Формат `TodoItem` (`types/todo.ts`) менялся (появились `reminderDate`, `notificationId`, `size`), но в хранилище нет поля версии и кода миграции. Старые записи читаются через `JSON.parse` без валидации.
- Files: `storage/todoStorage.ts` (`loadTodos`), `types/todo.ts`
- Impact: Записи старых версий могут содержать отсутствующие или некорректные поля (например, `size` вне `1|3|5|8|13`, `repeatFrequency` как строка), что приводит к падению рендера (`sizes[todo.size].color` в `components/Todo/Todo.tsx`) или к молчаливым ошибкам.
- Fix approach: Добавить `schemaVersion` в сохраняемый объект и функцию `normalizeTodo()` в `storage/todoStorage.ts`, которая заполняет значения по умолчанию и отбрасывает некорректные записи.

**Дублирование подписок и запросов разрешений на каждую карточку:**
- Issue: Хук `useNotifications()` вызывается в каждом экземпляре `Todo` (`components/Todo/Todo.tsx`). Каждый экземпляр в `useEffect` вызывает `requestPermissions()`, регистрирует два слушателя и создаёт канал `tasks`.
- Files: `hooks/useNotifications.ts`, `components/Todo/Todo.tsx`, `hooks/useTodos.ts`
- Impact: При N задачах на экране создаётся N слушателей и N запросов разрешений. При отказе в разрешении `alert("Разрешите уведомления в настройках")` выводится N раз. Лишние вызовы замедляют монтирование списка.
- Fix approach: Вынести инициализацию уведомлений в `App.tsx` (или отдельный провайдер) один раз; в `Todo` использовать только чистые функции `cancelNotification`/`rescheduleNextNotification` из `hooks/useNotifications.ts`.

**Дублирование логики завершения задачи:**
- Issue: Логика «выполнить повторяющуюся задачу» повторена в `onTaskComplete` и в двух ветках `showAlertForExpiredTask` (`components/Todo/Todo.tsx`). Блок `handleCompleteTask(...nextReminderIso(...))` скопирован трижды.
- Files: `components/Todo/Todo.tsx`
- Impact: Исправление ошибки нужно делать в нескольких местах, что уже привело к расхождениям (см. ниже про обработку без отмены уведомления).
- Fix approach: Вынести единую функцию `completeRepeatingTask(todo, baseDate)` в `utils/recurrence.ts` или в `hooks/useTodos.ts`.

**Дрейф и мёртвый код в `App.tsx`:**
- Issue: Состояние `today` дублирует `selectedDate` и обновляется двумя эффектами (`setToday` в двух `useEffect`). Пустой эффект, сбрасывающий `showAll`, выполняется при монтировании, хотя `showAll` уже имеет начальное значение `false`. Переменная `prevDateLoading` с `setTimeout(500)` без очистки.
- Files: `App.tsx`
- Impact: Лишние ре-рендеры; `setTimeout` без cleanup может вызвать `setState` после размонтирования.
- Fix approach: Удалить `today` (вычислять строку через `format(selectedDate, ...)` при необходимости), убрать избыточные эффекты, для `prevDateLoading` использовать `useEffect` с очисткой таймера.

**Нестрогая типизация:**
- Issue: `useRef<any>` для слушателей уведомлений в `hooks/useNotifications.ts`; `catch (e) { throw e; }` без смысла в `storage/todoStorage.ts` и `hooks/useNotifications.ts` (`scheduleNotification`); `id` задачи генерируется как `Date.now()` (`components/AddTodo/AddTodo.tsx`).
- Files: `hooks/useNotifications.ts`, `storage/todoStorage.ts`, `components/AddTodo/AddTodo.tsx`
- Impact: Ошибки компиляции не ловятся при рефакторинге; при создании двух задач в одну миллисекунду возможен одинаковый `id`, что сломает `keyExtractor` и обновление/удаление.
- Fix approach: Типизировать `Subscription` из `expo-notifications`; генерировать `id` через `crypto.randomUUID()` (или `Date.now()` + счётчик), заменить `catch/throw` на прямой вызов.

**Жёстко заданные строки и отсутствие i18n:**
- Issue: Все пользовательские тексты (ошибки, подсказки, подписи) захардкожены в компонентах.
- Files: `components/AddTodo/AddTodo.tsx`, `components/Todo/Todo.tsx`, `hooks/useTodos.ts`, `hooks/useNotifications.ts`
- Impact: Затрудняет добавление других языков и единообразное редактирование текстов.
- Fix approach: При необходимости вынести строки в `constants/strings.ts` (для текущего русскоязычного продукта — низкий приоритет).

## Known Bugs

**Удаление обычной (неповторяющейся) задачи не отменяет её уведомление:**
- Symptoms: После отметки неповторяющейся задачи как выполненной (или её «выполнения» через кнопку-чекбокс) уведомление, запланированное при создании, продолжает висеть в системе и сработает в указанное время для уже удалённой задачи.
- Files: `components/Todo/Todo.tsx` (ветка `if (!todo.isRepeat)` в `onTaskComplete` вызывает только `removeTodo`, без `cancelNotification`)
- Trigger: Создать неповторяющуюся задачу с напоминанием → отметить выполненной до времени напоминания.
- Workaround: Нет. Отменить уведомление вручную в настройках ОС нельзя, оно пропадёт только при его срабатывании или перезапуске ОС/очистке.
- Fix approach: В ветке `!todo.isRepeat` перед `removeTodo` вызвать `cancelNotification(todo.notificationId)`, если идентификатор задан.

**Неверный день на индикаторах недели (сдвиг на сутки в часовых поясах UTC+):**
- Symptoms: Точки-индикаторы задач в `WeekStrip` показываются на предыдущий день. Для пользователя в UTC+3 (Москва) `new Date(2026-10-24)` локальной полуночи при `toISOString()` даёт `2026-10-23`, тогда как задача с `nextDate: "2026-10-24"` парсится как UTC-полночь и сравнивается с датой `2026-10-24`, поэтому совпадения не происходит или происходит для соседнего дня.
- Files: `components/WeekStrip/WeekStrip.tsx` (`hasTasksOnDate`, строки с `toISOString().split("T")[0]`), `utils/todoFilters.ts` (используется `parse`, т.е. локальное время — здесь расхождение с `WeekStrip`)
- Trigger: Любой часовой пояс с положительным смещением от UTC. В отрицательных поясах возможен сдвиг в обратную сторону в `components/Todo/Todo.tsx` (`new Date(todo.nextDate).toLocaleDateString`).
- Workaround: Нет.
- Fix approach: Везде работать с датами как с локальными календарными строками: сравнивать через `format(date, "yyyy-MM-dd")` (date-fns) вместо `toISOString()`; парсить `nextDate` через `parse(todo.nextDate, "yyyy-MM-dd", new Date())`, а не `new Date(todo.nextDate)`. Выделить это в одну утилиту в `utils/time.ts`.

**Неконсистентный парсинг дат в разных местах:**
- Symptoms: Фильтры (`utils/todoFilters.ts`) используют локальный парсинг `parse(..., "yyyy-MM-dd")`, а `Todo.tsx` и `recurrence.ts` (`nextRecurrenceDate(new Date(todo.nextDate), ...)`) — `new Date("yyyy-MM-dd")`, который трактуется как UTC. Задача может попасть в один список по фильтру и отображаться с другой датой.
- Files: `utils/todoFilters.ts`, `components/Todo/Todo.tsx`, `utils/recurrence.ts`, `components/WeekStrip/WeekStrip.tsx`
- Trigger: Пограничные часы суток и часовые пояса, отличные от UTC.
- Workaround: Нет.
- Fix approach: см. предыдущий пункт.

**Состояние списка может не обновиться после выполнения задачи:**
- Symptoms: После выполнения повторяющейся задачи список обновляется только после нажатия «OK» в `Alert`. Если пользователь закроет алерт тапом вне окна (на Android `Alert` по умолчанию `cancelable`), `getAllTodos` не вызывается, и на экране остаётся старая дата.
- Files: `components/Todo/Todo.tsx` (`showAlert`, `showAlertForExpiredTask`)
- Trigger: Выполнить повторяющуюся задачу и закрыть алерт вне окна (Android).
- Workaround: Потянуть список или перезапустить приложение (если есть перезагрузка, иначе данные не видны).
- Fix approach: Вызывать `getAllTodos()` сразу после `await handleCompleteTask(...)`, не дожидаясь нажатия кнопки алерта.

**Перезапись по устаревшему объекту при выполнении задачи:**
- Symptoms: `handleCompleteTask` сохраняет `{ ...todo, ...}` где `todo` — пропс карточки на момент рендера. Если состояние уже изменилось (например, задача отредактирована в другом экземпляре модального окна), сохранятся старые поля.
- Files: `components/Todo/Todo.tsx` (`handleCompleteTask`), `storage/todoStorage.ts` (`updateTodo` заменяет запись целиком)
- Trigger: Редактирование задачи и быстрое её выполнение до обновления списка.
- Workaround: Нет.
- Fix approach: Читать актуальную запись из хранилища по `id` внутри `updateTodo`/отдельной функции `patchTodo(id, partial)`.

**Ошибка планирования уведомления оставляет задачу в неконсистентном состоянии:**
- Symptoms: В `hooks/useTodos.ts` (`onUpdateTodo`) при ошибке `scheduleNotification` старое `notificationId` уже отменено, `reminderDate` в записи остаётся прежним, а уведомление не создано. Пользователь видит алерт, но задача сохранена с напоминанием, которого нет.
- Files: `hooks/useTodos.ts` (`onUpdateTodo`), `hooks/useNotifications.ts`
- Trigger: Отказ в разрешении на уведомления или ошибка системного планировщика.
- Workaround: Снять и снова поставить напоминание в форме редактирования.
- Fix approach: При ошибке сбрасывать `reminderDate` в `undefined` и явно сообщать пользователю, что напоминание не сохранено.

**Прошедшее время напоминания молча переносится на +60 секунд:**
- Symptoms: Если пользователь выбрал дату/время в прошлом (например, сегодня, но время уже прошло), `getEffectiveReminderDate` сохраняет `reminderDate = now + 60с`. Пользователь не получает предупреждения, а в списке показывается время, которого он не выбирал.
- Files: `hooks/useNotifications.ts` (`getEffectiveReminderDate`), `hooks/useTodos.ts`
- Trigger: Создание задачи с напоминанием на время, которое уже прошло сегодня.
- Workaround: Нет.
- Fix approach: Валидировать `remindDate` в `components/AddTodo/AddTodo.tsx` и показывать ошибку вместо тихой подмены.

## Security Considerations

**Личные данные задач хранятся в открытом виде:**
- Risk: Названия и описания задач (потенциально чувствительная личная информация, в том числе о здоровье, если пользователь так использует приложение) лежат в AsyncStorage без шифрования. На Android AsyncStorage — это SQLite/файлы в песочнице приложения, доступные при root или резервном копировании.
- Files: `storage/todoStorage.ts`
- Current mitigation: Данные локальные, сети для задач нет. Резервное копирование Android по умолчанию может включать их (в `app.json` не задано `allowBackup: false`).
- Recommendations: Явно указать политику резервного копирования (`android.allowBackup`) в `app.json`; рассмотреть `expo-secure-store` для чувствительных данных, если они появятся.

**Рекламный SDK без механизма согласия пользователя:**
- Risk: `MobileAds.initialize()` вызывается в `App.tsx` без какого-либо запроса согласия (GDPR/152-ФЗ, требования магазинов приложений). В комментарии указано «Configure the user privacy data policy before init sdk», но конфигурации в коде нет.
- Files: `App.tsx` (эффект с `MobileAds.initialize()`, баннер с `adUnitId: "R-M-19204363-1"`)
- Current mitigation: Нет.
- Recommendations: Добавить экран/диалог согласия и передавать его в SDK до инициализации; опубликовать политику конфиденциальности, указав рекламный SDK (`yandex-mobile-ads`) и данные, которые он собирает.

**Разрешение `SCHEDULE_EXACT_ALARM` без проверки:**
- Risk: На Android 14+ точные будильники требуют явного разрешения пользователя. Код использует `exact: true` (`hooks/useNotifications.ts`), но не проверяет доступность и не предлагает открыть настройки, поэтому уведомления могут не сработать вовремя без видимой ошибки.
- Files: `app.json` (`android.permissions`), `hooks/useNotifications.ts` (`scheduleNotification`)
- Current mitigation: Нет.
- Recommendations: Проверять право на точные напоминания и при отказе предупреждать пользователя или использовать неточный режим.

**Ошибки в консоль:**
- Risk: Полные объекты уведомлений и ответов логируются (`console.log("Уведомление получено:", notification)`, `console.log("Пользователь нажал...", response)`), в том числе в продакшен-сборке.
- Files: `hooks/useNotifications.ts`, `App.tsx` (`console.log("error", e.nativeEvent)`)
- Current mitigation: Нет.
- Recommendations: Убрать логирование полезной нагрузки или обернуть его в `__DEV__`.

## Performance Bottlenecks

**Полная перезапись всего списка при каждой операции:**
- Problem: Любое изменение (добавление, отметка, удаление) читает и пишет весь массив задач.
- Files: `storage/todoStorage.ts`
- Cause: Единый ключ `TODOS`, нет индексации.
- Improvement path: Хранить задачи по отдельным ключам или в SQLite; обновлять список оптимистично в состоянии.

**Каждая карточка создаёт собственные подписки и вызывает `requestPermissions`:**
- Problem: См. раздел Tech Debt — N экземпляров хука на N карточек при каждом рендере списка.
- Files: `components/Todo/Todo.tsx`, `hooks/useNotifications.ts`
- Cause: Хук уведомлений вызывается в компоненте элемента списка.
- Improvement path: Вынести в корень приложения.

**Пересчёт фильтров и индикаторов недели на каждый рендер:**
- Problem: `WeekStrip` для каждого из 7 дней и каждой задачи вызывает `new Date(...)` и `toISOString()` (`hasTasksOnDate` — O(7 × N) с созданием объектов Date).
- Files: `components/WeekStrip/WeekStrip.tsx`
- Cause: Нет предварительной группировки задач по дате.
- Improvement path: Сгруппировать задачи по `nextDate` через `useMemo` один раз в `App.tsx` или в хуке.

**`FlatList` без оптимизаций:**
- Problem: Нет `getItemLayout`, `initialNumToRender`, `windowSize`; `renderItem` создаёт новую стрелку-функцию с `openEditModal={() => openEditModal(item)}`.
- Files: `App.tsx` (`FlatList`)
- Cause: Список не оптимизирован, карточки не мемоизированы.
- Improvement path: Обернуть `Todo` в `React.memo`, передавать стабильные колбэки.

## Fragile Areas

**Работа с датами на основе строк и часовых поясов:**
- Files: `utils/todoFilters.ts`, `utils/recurrence.ts`, `utils/time.ts`, `components/WeekStrip/WeekStrip.tsx`, `components/Todo/Todo.tsx`, `components/AddTodo/AddTodo.tsx`
- Why fragile: Смешаны три подхода: `parse` (локальный), `new Date(str)` (UTC), `toISOString()` (UTC-срез). Ошибка проявляется только в конкретных часовых поясах и в пограничные часы.
- Safe modification: Любые изменения дат делать только через функции из одного модуля (`utils/time.ts`), покрыть тестами с фиксированным `TZ`.
- Test coverage: Тестов нет.

**Логика повторений и напоминаний связана через `reminderDate`:**
- Files: `utils/recurrence.ts`, `hooks/useNotifications.ts` (`rescheduleNextNotification`), `components/Todo/Todo.tsx`
- Why fragile: В комментариях прямо указано, что сдвиг `repeatFrequency` должен выполняться только в одном месте (`utils/recurrence.ts`), иначе возникает двойной сдвиг (см. ссылку на `.planning/debug/recurring-notification-stops-after-complete.md`). Любой вызов `rescheduleNextNotification` с уже сдвинутой датой ломает инвариант.
- Safe modification: Не прибавлять `repeatFrequency` вне `nextRecurrenceDate`; при изменении контракта обновить все вызовы из `Todo.tsx`.
- Test coverage: Тестов нет; регрессия уже была.

**Обработка событий уведомлений:**
- Files: `hooks/useNotifications.ts`
- Why fragile: `addNotificationResponseReceivedListener` только пишет лог; переход к задаче по нажатию на уведомление не реализован, поле `data.date` не используется.
- Safe modification: Перед добавлением навигации по нажатию учесть, что слушатели регистрируются N раз (см. Tech Debt).
- Test coverage: Нет.

**Модальное окно редактирования с синхронизацией через `useEffect`:**
- Files: `components/AddTodo/AddTodo.tsx`
- Why fragile: Состояние формы дублирует `editData` и заполняется в эффекте (`useEffect` по `editData`); `clearFields`/`onModalClose` сбрасывают поля в нескольких местах; `error` обновляется через спред устаревшего объекта (`setError({...error, ...})`).
- Safe modification: Использовать одно объединённое состояние формы (`useReducer`) и функцию `resetForm`.
- Test coverage: Нет.

## Scaling Limits

**Хранилище AsyncStorage:**
- Current capacity: Один ключ-строка JSON; на Android AsyncStorage ограничен размером окна БД (около 6 МБ по умолчанию в старых версиях; актуальные версии `@react-native-async-storage/async-storage` 2.x используют SQLite без жёсткого лимита, но чтение всего массива растёт линейно).
- Limit: Задержки на каждой операции при тысячах задач; рост размера JSON.
- Scaling path: Перейти на `expo-sqlite` с индексом по `nextDate`.

**Уведомления на устройстве:**
- Current capacity: Каждая задача с напоминанием создаёт одно запланированное уведомление; при повторяющихся задачах — одно за раз.
- Limit: Android ограничивает число запланированных уведомлений/будильников на приложение; при большом количестве задач часть напоминаний может быть отброшена системой без сообщения.
- Scaling path: Планировать только ближайшее напоминание (уже так сделано для повторяющихся) и пересчитывать при запуске приложения.

## Dependencies at Risk

**`yandex-mobile-ads` (^8.0.0):**
- Risk: Нативный модуль, требует development build или prebuild (не работает в Expo Go); диапазон `^8.0.0` может подтянуть несовместимое минорное обновление.
- Impact: Сборка может сломаться при обновлении Expo/React Native (сейчас `expo ~54.0.34`, `react-native 0.81.5`).
- Migration plan: Зафиксировать версию точно (`8.x.y`) и проверять при каждом обновлении SDK; при необходимости перейти на `react-native-google-mobile-ads`, если рекламный сервис меняется.

**Зависимости на `expo-notifications` и поведение Android:**
- Risk: Поведение планирования точных уведомлений различается между версиями Android (см. `SCHEDULE_EXACT_ALARM` выше).
- Impact: Напоминания могут не срабатывать на отдельных устройствах.
- Migration plan: Тестировать на Android 13/14/15 перед релизом.

## Missing Critical Features

**Автоматическое тестирование отсутствует:**
- Problem: В `package.json` нет скриптов `test`, `lint`, нет зависимостей `jest`/`@testing-library/react-native`, нет конфигурации ESLint/Prettier.
- Blocks: Безопасный рефакторинг логики дат и повторений; обнаружение регрессий вида «двойной сдвиг даты».

**Нет проверки версии при обновлении данных:**
- Problem: Нет механизма миграции хранилища (см. Tech Debt).
- Blocks: Безопасное изменение формата `TodoItem`.

**Нет резервного копирования и экспорта данных:**
- Problem: Задачи живут только на устройстве; при переустановке приложения (или сбросе данных) они теряются.
- Blocks: Перенос данных между устройствами.

## Test Coverage Gaps

**Логика дат и повторений (`utils/`):**
- What's not tested: `nextRecurrenceDate`, `nextReminderIso`, `filterDisplayedTodos`, `isExpired`, `isFuture`, `parseTime`/`formatTime`.
- Files: `utils/recurrence.ts`, `utils/todoFilters.ts`, `utils/time.ts`
- Risk: Ошибки на границе часовых поясов и полуночи остаются незамеченными (см. Known Bugs).
- Priority: High

**Хранилище и операции с задачами:**
- What's not tested: `addTodo`, `removeTodo`, `updateTodo`, конкурентные записи, поведение при повреждённом JSON.
- Files: `storage/todoStorage.ts`
- Risk: Потеря данных при параллельных операциях.
- Priority: High

**Жизненный цикл уведомлений:**
- What's not tested: Отмена уведомления при удалении/выполнении, перепланирование после выполнения повторяющейся задачи, обработка отказа в разрешении.
- Files: `hooks/useNotifications.ts`, `components/Todo/Todo.tsx`, `hooks/useTodos.ts`
- Risk: Зависшие уведомления для удалённых задач (уже воспроизводится), двойной сдвиг даты (регрессия уже была).
- Priority: High

**Компоненты UI:**
- What's not tested: `AddTodo` (валидация формы), `Todo` (отметка выполнения), `WeekStrip` (индикаторы), `App` (навигация по датам).
- Files: `components/AddTodo/AddTodo.tsx`, `components/Todo/Todo.tsx`, `components/WeekStrip/WeekStrip.tsx`, `App.tsx`
- Risk: Регрессии в пользовательских сценариях остаются незамеченными.
- Priority: Medium

---

*Concerns audit: 2026-10-24*
