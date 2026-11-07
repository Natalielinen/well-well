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
  if (time.defaultReminderDate) {
    for (const [day, hour, minute, expectedDay, expectedHour] of [
      [24, 14, 20, 24, 15], [24, 23, 20, 25, 0], [30, 14, 0, 30, 15], [24, 14, 0, 24, 15],
    ]) {
      const now = new Date(2026, 9, 24, hour, minute);
      const result = time.defaultReminderDate(new Date(2026, 9, day), now);
      assert.equal(result.getDate(), expectedDay);
      assert.equal(result.getHours(), expectedHour);
      assert.equal(result.getMinutes(), 0);
      assert.ok(result > now);
    }
    console.log(zone, 'REMINDER_DEFAULT_OK');
  }
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
async function checkCompletion() {
  const originalLoad = Module._load;
  const path = require('node:path');
  let records = [], writes = 0, failSchedule = false, failCancel = false;
  const events = [], alerts = [];
  const asyncStorage = {
    async getItem() { return JSON.stringify(records); },
    async setItem(key, value) { records = JSON.parse(value); writes++; events.push('save'); },
  };
  const notificationFns = {
    async cancelNotification(id) { events.push('cancel:' + id); if (failCancel) throw new Error('cancel'); },
    async rescheduleNextNotification(todo) {
      events.push('reschedule');
      if (failSchedule) throw new Error('schedule');
      return { notificationId: todo.reminderDate ? 'next-id' : undefined };
    },
    async notifyReminderFailed() { events.push('failure'); },
  };
  Module._load = function(name, parent, main) {
    if (name === '@react-native-async-storage/async-storage') return { __esModule: true, default: asyncStorage };
    if (name === 'react') return { useRef: value => ({ current: value }) };
    if (name === 'react-native') return { View: 'View', Text: 'Text', TouchableOpacity: 'Button', Alert: { alert: (...args) => { events.push('alert'); alerts.push(args); } } };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === './styles') return { styles: {} };
    if (name === 'lucide-react-native') return {};
    if (name === '../../hooks/useNotifications') return { ...notificationFns, useNotifications: () => notificationFns };
    return originalLoad.call(this, name, parent, main);
  };
  try {
    const storage = require('../storage/todoStorage');
    const base = { id: 1, title: 'old', description: 'description', size: 1, isRepeat: true, repeatFrequency: 2, nextDate: time.toDateKey(new Date()), lastUpdated: '' };
    records = [{ ...base, title: 'new', notificationId: 'old-id' }];
    await storage.patchTodo(1, { nextDate: '2026-12-01', notificationId: undefined, id: 999 });
    assert.equal(records[0].title, 'new');
    assert.equal(records[0].id, 1);
    assert.equal(records[0].notificationId, undefined);
    const writeCount = writes;
    assert.equal(await storage.patchTodo(404, { title: 'ghost' }), undefined);
    assert.equal(writes, writeCount);
    const file = path.resolve(__dirname, '../components/Todo/Todo.tsx');
    const componentModule = new Module(file, module);
    componentModule.filename = file;
    componentModule.paths = Module._nodeModulePaths(path.dirname(file));
    componentModule._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, file);
    const Todo = componentModule.exports.default;
    const flatten = node => !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(flatten)];
    const render = (todo, extras = {}) => Todo({ todo, isTodoExpired: false, isFuture: false,
      getAllTodos: async () => { events.push('refresh'); }, openEditModal() {}, ...extras });
    const checkbox = tree => flatten(tree).find(node => node.type === 'Button').props.onPress;
    records = [{ ...base, isRepeat: false, notificationId: 'fresh-id' }]; events.length = 0;
    const single = checkbox(render({ ...base, isRepeat: false, notificationId: 'stale-id' }));
    await Promise.all([single(), single()]);
    assert.deepEqual(events, ['cancel:fresh-id', 'save', 'refresh', 'alert']);
    assert.equal(records.length, 0);
    assert.equal(alerts.at(-1)[2][0].onPress, undefined);
    records = [{ ...base, title: 'edited', repeatFrequency: 3 }]; events.length = 0;
    const repeat = checkbox(render(base));
    await Promise.all([repeat(), repeat()]);
    assert.equal(records[0].title, 'edited');
    assert.equal(records[0].nextDate, recurrence.nextRecurrenceDate(time.parseDateKey(base.nextDate), 3));
    assert.deepEqual(events, ['reschedule', 'save', 'refresh', 'alert']);
    records = [{ ...base, reminderDate: new Date().toISOString(), notificationId: 'old-id' }]; events.length = 0; failSchedule = true;
    await checkbox(render(base))();
    assert.equal(records[0].reminderDate, undefined);
    assert.equal(records[0].notificationId, undefined);
    assert.deepEqual(events, ['reschedule', 'save', 'refresh', 'failure']);
    failSchedule = false;
    events.length = 0;
    await checkbox(render(base, { isTodoExpired: true }))();
    assert.equal(alerts.at(-1)[2][2].text, 'Отмена');
    assert.equal(alerts.at(-1)[3].cancelable, true);
    assert.deepEqual(events, ['alert']);
    failCancel = true; records = [{ ...base, isRepeat: false, notificationId: 'missing' }];
    await checkbox(render({ ...base, isRepeat: false }))();
    assert.equal(records.length, 0);
    console.log('STORAGE_AND_COMPLETION_OK');
  } finally { Module._load = originalLoad; }
}
function checkForm() {
  const originalLoad = Module._load;
  const path = require('node:path');
  let slots = [], cursor = 0, effects = [], deps = [], saved = [], closed = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useEffect(fn, dependencies) {
      const index = cursor++;
      if (!deps[index] || dependencies.some((value, i) => !Object.is(value, deps[index][i]))) {
        deps[index] = dependencies; effects.push(fn);
      }
    },
  };
  Module._load = function(name, parent, main) {
    if (name === 'react') return react;
    if (name === 'react-native') return { Platform: {OS: 'android'}, Modal: 'Modal', View: 'View', Text: 'Text', TextInput: 'Input', Switch: 'Switch', TouchableOpacity: 'Button', ScrollView: 'ScrollView' };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === './styles') return { styles: {} };
    if (name === '@react-native-community/datetimepicker') return { __esModule: true, default: 'Picker' };
    return originalLoad.call(this, name, parent, main);
  };
  try {
    const file = path.resolve(__dirname, '../components/AddTodo/AddTodo.tsx');
    const formModule = new Module(file, module);
    formModule.filename = file;
    formModule.paths = Module._nodeModulePaths(path.dirname(file));
    formModule._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, file);
    const AddTodo = formModule.exports.default;
    let props;
    const render = () => {
      cursor = 0; let tree = AddTodo(props);
      const pending = effects; effects = [];
      if (pending.length) { pending.forEach(fn => fn()); cursor = 0; tree = AddTodo(props); }
      return tree;
    };
    const flatten = node => !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(flatten)];
    const find = predicate => flatten(render()).find(predicate);
    const save = () => find(node => node.type === 'Button' && node.props.children?.props?.children === 'Сохранить').props.onPress();
    const reset = editData => {
      slots = []; deps = []; effects = []; saved = []; closed = 0;
      props = { showModal: true, editData, currentDate: new Date(), closeModal: () => { closed++; },
        setEditData() {}, onAddTodo: task => saved.push(task), onUpdateTodo: (id, task) => saved.push(task) };
      render();
    };
    reset(null);
    find(node => node.type === 'Input' && node.props.placeholder === 'Что нужно сделать?').props.onChangeText('task');
    find(node => node.type === 'Switch' && node.props.onValueChange.name === 'onRemindToggle').props.onValueChange(true);
    const reminderButton = () => find(node => node.type === 'Button' && node.props.onPress?.toString().includes('setShowRemindDatepicker'));
    reminderButton().props.onPress();
    const past = new Date(Date.now() - 86400000);
    find(node => node.type === 'Picker' && node.props.onChange.name === 'onRemindDateChange').props.onChange({type: 'set'}, past);
    save();
    assert.equal(saved.length, 0); assert.equal(closed, 0);
    assert.ok(find(node => node.type === 'Text' && node.props.children === 'Время напоминания уже прошло'));
    const edit = { id: 1, title: 'old', description: '', isRepeat: true, repeatFrequency: 1, size: 1,
      nextDate: time.toDateKey(new Date()), reminderDate: past.toISOString() };
    reset(edit);
    find(node => node.type === 'Input' && node.props.placeholder === 'Добавьте детали...').props.onChangeText('edited');
    save();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].reminderDate, edit.reminderDate);
    assert.equal(saved[0].description, 'edited');
    reset(edit);
    find(node => node.type === 'Switch' && node.props.onValueChange.name === 'onRemindToggle').props.onValueChange(false);
    save();
    assert.equal(saved[0].reminderDate, undefined);
    reset(edit);
    const toggle = () => find(node => node.type === 'Switch' && node.props.onValueChange.name === 'onRemindToggle').props.onValueChange;
    toggle()(false); toggle()(true); save();
    assert.ok(new Date(saved[0].reminderDate) > new Date());
    console.log('FORM_VALIDATION_OK');
  } finally { Module._load = originalLoad; }
}
checkNotifications().then(checkCompletion).then(checkForm).catch(error => { console.error(error); process.exitCode = 1; });
