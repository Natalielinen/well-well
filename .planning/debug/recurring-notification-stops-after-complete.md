# Debug: уведомления повторяющейся задачи перестают приходить после выполнения

- **Дата:** 2026-07-25
- **Фаза:** пост-фаза 02 (регрессия, найденная в ручном тестировании)
- **Кто нашёл:** пользователь
- **Симптом:** У повторяющейся задачи с напоминанием первое уведомление (сразу после создания) приходит корректно. После того как задачу отметили выполненной, уведомления по ней больше не приходят.
- **Режим:** только диагностика перед правкой.

## Как воспроизвести

1. Создать повторяющуюся задачу (`isRepeat = true`, `repeatFrequency > 0`) с напоминанием (`reminderDate`).
2. Дождаться первого уведомления — оно приходит.
3. Отметить задачу выполненной (`onTaskComplete`).
4. Уведомления на следующие циклы не приходят (или приходят не в срок и «уезжают» всё дальше).

## Трассировка

### Путь создания (работает)

- `App.onAddTodo` ([App.tsx:142-163](../../App.tsx)) вызывает `scheduleNotification(...reminderDate)` напрямую, без сдвига даты.
- `reminderDate` при создании — корректный ISO: `remindDate.toISOString()` ([AddTodo.tsx:203](../../components/AddTodo/AddTodo.tsx)).
- Поэтому первое уведомление планируется правильно.

### Путь выполнения (ломается)

- `onTaskComplete`, ветка «повторяющаяся, не просрочена» ([Todo.tsx:143-159](../../components/Todo/Todo.tsx)):
  - `newNextDate = addDays(new Date(todo.nextDate), todo.repeatFrequency)` — дата уже сдвинута на **+1 цикл**.
  - `reminderDate` переносится на эту же `newNextDate` и передаётся в формате `'yyyy-MM-dd HH:mm'`.
- `handleCompleteTask` ([Todo.tsx:47-55](../../components/Todo/Todo.tsx)) собирает `updatedTodo` с уже сдвинутыми `nextDate` и `reminderDate` и передаёт его в `rescheduleNextNotification`.
- `rescheduleNextNotification` ([useNotifications.ts:59-81](../../hooks/useNotifications.ts)):
  - строки 69-74 — **снова** прибавляют `repeatFrequency` к `nextDate`:
    ```ts
    if (todo.repeatFrequency && todo.nextDate) {
      const nextNextDate = addDays(new Date(todo.nextDate), todo.repeatFrequency);
      nextDate.setFullYear(nextNextDate.getFullYear());
      nextDate.setMonth(nextNextDate.getMonth());
      nextDate.setDate(nextNextDate.getDate());
    }
    ```
- Результат сохраняется обратно: `handleCompleteTask` пишет `reminderDate = adjustedDate.toISOString()` (уже дважды сдвинутую дату).

## Корневая причина

### Дефект 1 (главный): двойное прибавление `repeatFrequency`

`onTaskComplete` **и** `rescheduleNextNotification` независимо прибавляют `repeatFrequency`. В итоге уведомление планируется на `дата + 2×repeatFrequency`, тогда как задача имеет `nextDate = дата + 1×repeatFrequency`. Напоминание всегда на один цикл позже реального срока. Так как сдвинутая `reminderDate` сохраняется в хранилище, при каждом последующем выполнении сдвиг накапливается — уведомления «уезжают» в будущее и перестают приходить.

Причина рассинхрона: `rescheduleNextNotification` изначально проектировался как единственная точка, вычисляющая «следующее» напоминание (`+repeatFrequency`). Но `onTaskComplete` тоже вычисляет следующую дату (нужно для `nextDate` в хранилище и для Alert с датой следующего выполнения). Обязанности пересеклись.

### Дефект 2 (усугубляющий): хрупкий формат даты

`handleCompleteTask` передаёт `reminderDate` строкой `'yyyy-MM-dd HH:mm'` (пробел вместо `T`, без секунд и таймзоны). `new Date('2026-08-02 14:30')` на движке Hermes (React Native) — **Invalid Date**. Далее `setFullYear/setMonth/setDate` частично «восстанавливают» дату, но время сбрасывается в полночь; а если убрать блок с `repeatFrequency`, `new Date` от невалидной строки приведёт к срыву планирования. Формат обязан быть ISO, как на пути создания.

## Направление правки

1. **`hooks/useNotifications.ts`** — удалить блок 69-74 в `rescheduleNextNotification`. Функция должна планировать уведомление на уже готовую `todo.reminderDate` (её вычислил вызывающий код), только нормализуя «прошлое → +60с» через `getEffectiveReminderDate`.
2. **`components/Todo/Todo.tsx`** — передавать `reminderDate` в ISO: заменить `format(getUpdatedTime(...), 'yyyy-MM-dd HH:mm')` на `getUpdatedTime(...).toISOString()` в трёх местах (строки 93, 110, 154).

## Проверка после правки

- Выполнение повторяющейся задачи с `nextDate = D` планирует уведомление ровно на `D` в заданное время (не на `D + repeatFrequency`).
- Повторные выполнения не накапливают сдвиг.
- `tsc` собирается без ошибок.

## Затронутые файлы

- `hooks/useNotifications.ts` — двойное прибавление `repeatFrequency` (69-74).
- `components/Todo/Todo.tsx` — передача `reminderDate` в нестандартном формате (93, 110, 154).
