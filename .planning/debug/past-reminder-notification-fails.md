---
status: diagnosed
trigger: "При создании задачи с уведомлением в прошлом, кнопка сохранить активна, но при нажатии ничего не происходит. Задача не сохраняется, окно создания не закрывается, сообщений в UI об ошибке нет."
created: 2026-07-16T11:09:16+03:00
updated: 2026-07-16T11:09:16+03:00
---

## Current Focus

hypothesis: "Создание задачи с напоминанием в прошлом блокируется локальной валидацией isBefore(remindDate, new Date()) в onCreate (AddTodo.tsx:176-179), которая делает early return, не вызывая onAddTodo и не закрывая модал. При этом установленная ошибка error.minDate нигде не рендерится в JSX, поэтому для пользователя всё выглядит как 'ничего не происходит, без сообщения об ошибке'. Логика переноса прошедшего напоминания на Date.now()+60с уже реализована в scheduleNotification (useNotifications.ts:25-27), но она никогда не достигается из-за блокирующей валидации."
test: "Анализ потока onCreate при showRemindField=true и remindDate в прошлом"
expecting: "Подтверждение что ранний return на линии 178 предотвращает вызов onAddTodo/onUpdateTodo и onModalClose, и что error.minDate не отображается в UI"
next_action: "Зафиксировать root cause, вернуть структурированный отчёт (режим find_root_cause_only)"

## Symptoms

expected: При создании задачи с reminder в прошлом уведомление должно быть перенесено на Date.now() + 60с, задача сохраняется и модал закрывается
actual: Кнопка "Сохранить" активна, но при нажатии ничего не происходит. Задача не сохраняется, окно создания не закрывается, сообщений в UI об ошибке нет.
errors: (нет сообщений об ошибке в UI/консоли)
reproduction: Открыть модал создания задачи, включить "Напомнить?", выбрать дату/время напоминания в прошлом, ввести название, нажать "Сохранить".
started: всегда воспроизводится (always broken)

## Eliminated

(нет)

## Evidence

- timestamp: 2026-07-16T11:09:16+03:00
  checked: AddTodo.tsx onCreate (lines 151-206)
  found: "Строки 176-179: if (showRemindField && remindDate && isBefore(remindDate, new Date())) { setError({...error, minDate: 'Время напоминания не может быть в прошлом'}); return; } — early return без вызова onAddTodo/onUpdateTodo и без onModalClose()."
  implication: "Валидация прошедшего напоминания блокирует сохранение и закрытие модала, прерывая выполнение до вызова onAddTodo/onUpdateTodo и onModalClose на строке 205."

- timestamp: 2026-07-16T11:09:16+03:00
  checked: AddTodo.tsx JSX (render-часть, lines 208-399) и grep error.(minDate|title|repeatFrequency)
  found: "Поле error.minDate (и error.title, error.repeatFrequency) НИГДЕ не рендерится в JSX. grep по components/AddTodo не нашёл ни одного обращения к отображению error-полей."
  implication: "Даже при срабатывании валидации пользователь не видит никакого сообщения об ошибке — отсюда симптом 'сообщений в UI об ошибке нет'."

- timestamp: 2026-07-16T11:09:16+03:00
  checked: useNotifications.ts scheduleNotification (lines 20-49)
  found: "Строки 25-27: if (date <= new Date()) { date = new Date(Date.now() + 60000); } — желаемая логика переноса прошедшего напоминания на Date.now()+60с УЖЕ реализована здесь."
  implication: "Корректная обработка прошедшего напоминания существует, но недостижима из onCreate из-за блокирующей валидации isBefore выше по стеку."

- timestamp: 2026-07-16T11:09:16+03:00
  checked: AddTodo.tsx кнопка Сохранить (lines 385-394)
  found: "TouchableOpacity Сохранить имеет disabled={!title.trim()} — активна при наличии названия, независимо от remindDate."
  implication: "Объясняет симптом 'кнопка сохранить активна': валидация прошедшего напоминания не отключает кнопку, а срабатывает только при нажатии (early return)."

- timestamp: 2026-07-16T11:09:16+03:00
  checked: App.tsx onAddTodo (lines 142-162)
  found: "onAddTodo вызывает scheduleNotification (которая корректно сдвигает дату), затем addTodo и setAllTodos. Этот код корректен, но не выполняется из-за early return в onCreate."
  implication: "Причина не в сохранении или планировании уведомления, а во входной валидации в AddTodo."

## Resolution

root_cause: "Локальная валидация в AddTodo.tsx onCreate (lines 176-179) отклоняет задачу с напоминанием в прошлом через isBefore(remindDate, new Date()) с early return, что предотвращает вызов onAddTodo/onUpdateTodo (сохранение) и onModalClose (закрытие модала). Установленная ошибка error.minDate никогда не отображается в JSX, поэтому пользователь видит 'ничего не происходит, без ошибки'. Желаемая логика переноса прошедшего напоминания на Date.now()+60с уже есть в scheduleNotification (useNotifications.ts:25-27), но недостижима."
fix: ""
verification: ""
files_changed: []
