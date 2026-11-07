// Проверки регрессий фазы 03.1 без установки тестового раннера.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const time = require('../utils/time');
const recurrence = require('../utils/recurrence');
const filters = require('../utils/todoFilters');
for (const zone of ['Europe/Moscow', 'America/New_York']) {
  process.env.TZ = zone;
  const date = time.parseDateKey('2026-10-24');
  assert.equal(date.getHours(), 0);
  assert.equal(date.getDate(), 24);
  assert.equal(time.toDateKey(new Date(2026, 9, 24, 23, 59)), '2026-10-24');
  assert.equal(recurrence.nextRecurrenceDate(date, 1), '2026-10-25');
  const reminder = new Date(recurrence.nextReminderIso('2026-10-25', new Date(2026, 9, 24, 9, 30).toISOString()));
  assert.equal(reminder.getDate(), 25);
  assert.equal(reminder.getHours(), 9);
  assert.equal(reminder.getMinutes(), 30);
  assert.equal(filters.isToday({ nextDate: '2026-10-24' }, new Date(2026, 9, 24, 12)), true);
  assert.equal(filters.isToday({ nextDate: '2026-10-24' }, new Date(2026, 9, 25, 0, 30)), false);
  console.log(zone, 'DATEKEY_OK');
}

async function checkNotifications() {
  const originalLoad = Module._load;
  const scheduled = [], cancelled = [], alerts = [];
  let status = 'granted', failSchedule = false, permissionReads = 0;
  const notifications = {
    setNotificationHandler() {},
    SchedulableTriggerInputTypes: { DATE: 'date' },
    async getPermissionsAsync() { permissionReads++; return { status }; },
    async scheduleNotificationAsync(request) {
      if (failSchedule) throw new Error('system failure');
      scheduled.push(request);
      return 'new-id';
    },
    async cancelScheduledNotificationAsync(id) { cancelled.push(id); },
  };
  const react = { useState: () => [[], () => {}], useEffect() {}, useRef: () => ({current: null}) };
  const storage = { async addTodo(t) { storage.saved = t; }, async updateTodo(id, t) { storage.saved = t; }, async loadTodos() { return []; } };
  Module._load = function(name, parent, main) {
    if (name === 'expo-notifications') return notifications;
    if (name === 'expo-device') return { isDevice: false };
    if (name === 'react-native') return { Platform: { OS: 'android' }, Alert: { alert: (...args) => alerts.push(args) } };
    if (name === 'react') return react;
    if (name === '../storage/todoStorage') return storage;
    return originalLoad.call(this, name, parent, main);
  };
  try {
    const n = require('../hooks/useNotifications');
    const future = new Date(Date.now() + 3600000);
    assert.equal((await n.scheduleNotification('task', 'body', future)).notificationId, 'new-id');
    assert.equal(scheduled[0].trigger.date, future);
    const before = permissionReads;
    status = 'denied';
    assert.equal((await n.scheduleNotification('task', 'body', new Date(0))).notificationId, undefined);
    assert.equal(permissionReads, before, 'Прошедшее время проверяется до разрешения');
    await assert.rejects(n.scheduleNotification('task', 'body', future), /permission/);
    assert.equal(scheduled.length, 1);
    const todos = require('../hooks/useTodos').useTodos();
    const task = { id: 1, title: 'task', description: '', nextDate: '2026-11-08', reminderDate: future.toISOString() };
    await todos.onAddTodo(task);
    assert.equal(storage.saved.reminderDate, undefined);
    assert.equal(storage.saved.notificationId, undefined);
    assert.match(alerts.at(-1)[1], /разрешите уведомления/);
    status = 'granted'; failSchedule = true;
    await todos.onUpdateTodo(1, task);
    assert.equal(storage.saved.reminderDate, undefined);
    assert.match(alerts.at(-1)[1], /Попробуйте/);
    failSchedule = false;
    const alertCount = alerts.length;
    await todos.onUpdateTodo(1, { ...task, reminderDate: new Date(0).toISOString() });
    assert.equal(storage.saved.reminderDate, new Date(0).toISOString());
    assert.equal(storage.saved.notificationId, undefined);
    assert.equal(alerts.length, alertCount);
    const result = await n.rescheduleNextNotification({ ...task, notificationId: 'old-id' });
    assert.equal(result.notificationId, 'new-id');
    assert.deepEqual(cancelled, ['old-id']);
    assert.equal(scheduled.at(-1).trigger.date.toISOString(), task.reminderDate);
    console.log('NOTIFICATIONS_OK');
  } finally { Module._load = originalLoad; }
}
checkNotifications().catch(error => { console.error(error); process.exitCode = 1; });
