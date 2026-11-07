// Проверки регрессий фазы 03.1 без установки тестового раннера.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Проверка зависла на await')), 3000);
    })]);
  } finally { clearTimeout(timer); }
}
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
    // CR-02: время истекает именно во время незавершённого permissions Promise.
    const realNow = Date.now;
    const getPermissions = notifications.getPermissionsAsync;
    try {
      for (const elapsed of [1000, 2000]) {
        let now = 1800000000000;
        Date.now = () => now;
        const gate = deferred();
        notifications.getPermissionsAsync = () => gate.promise;
        const count = scheduled.length;
        const pending = n.scheduleNotification('task', 'body', new Date(now + 1000));
        assert.equal(scheduled.length, count);
        now += elapsed;
        gate.resolve({ status: 'granted' });
        assert.equal((await bounded(pending)).notificationId, undefined);
        assert.equal(scheduled.length, count, 'CR-02: прошедшая/равная now дата не передаётся в SDK');
      }
      console.log('CR02_PERMISSION_TIME_OK');
    } finally { Date.now = realNow; notifications.getPermissionsAsync = getPermissions; }
  } finally { Module._load = originalLoad; }
}
async function checkCompletion() {
  const originalLoad = Module._load;
  const path = require('node:path');
  let records = [], writes = 0, failSchedule = false, failCancel = false;
  let rescheduleDuringTest;
  let cancelDuringTest;
  const events = [], alerts = [];
  const asyncStorage = {
    async getItem() { return JSON.stringify(records); },
    async setItem(key, value) { records = JSON.parse(value); writes++; events.push('save'); },
  };
  const notificationFns = {
    async cancelNotification(id) {
      events.push('cancel:' + id);
      if (cancelDuringTest) await cancelDuringTest(id);
      if (failCancel) throw new Error('cancel');
    },
    async rescheduleNextNotification(todo) {
      if (rescheduleDuringTest) return rescheduleDuringTest(todo);
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
    failCancel = false;
    // CR-01: одна сессия диалога, одноразовый выбор, отмена и dismiss.
    for (const extras of [{ isTodoExpired: true }, { isFuture: true }]) {
      for (const choice of ['Сегодня', 'Дата в задаче']) {
        const initial = { ...base, nextDate: '2026-11-01' };
        records = [{ ...initial }]; events.length = 0; alerts.length = 0;
        const press = checkbox(render(initial, extras));
        await Promise.all([press(), press()]);
        assert.equal(alerts.length, 1, 'CR-01: двойной тап открывает только один диалог');
        const dialog = alerts[0];
        const selected = dialog[2].find(button => button.text === choice).onPress;
        const beforeWrites = writes;
        await selected();
        const expected = choice === 'Дата в задаче' ? '2026-11-03' : time.toDateKey(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2));
        assert.equal(records[0].nextDate, expected);
        assert.equal(writes, beforeWrites + 1);
        await selected();
        await dialog[2].find(button => button.text !== choice && button.text !== 'Отмена').onPress();
        dialog[3].onDismiss();
        assert.equal(writes, beforeWrites + 1, 'CR-01: старые callbacks не выполняют задачу повторно');
        // Следующее намеренное выполнение получает актуальные props.
        await checkbox(render({ ...records[0] }, extras))();
        assert.equal(alerts.length, 2);
        alerts.at(-1)[2].find(button => button.text === 'Отмена').onPress();
      }
      for (const dismissKind of ['cancel', 'dismiss']) {
        records = [{ ...base }]; events.length = 0; alerts.length = 0;
        const press = checkbox(render(base, extras));
        const beforeWrites = writes;
        await press();
        const dialog = alerts[0];
        assert.equal(dialog[2][2].style, 'cancel');
        if (dismissKind === 'cancel') dialog[2][2].onPress();
        else dialog[3].onDismiss();
        await dialog[2][0].onPress();
        await dialog[2][1].onPress();
        assert.equal(writes, beforeWrites);
        assert.deepEqual(records, [base]);
        assert.deepEqual(events, ['alert']);
        await press();
        assert.equal(alerts.length, 2, 'CR-01: отмена/dismiss освобождает lock');
        alerts.at(-1)[3].onDismiss();
      }
    }
    records = [{ ...base }]; alerts.length = 0;
    const waitingPress = checkbox(render(base, { isTodoExpired: true }));
    await waitingPress();
    const waitingDialog = alerts[0];
    const enteredChoice = deferred(), releaseChoice = deferred();
    rescheduleDuringTest = async () => {
      enteredChoice.resolve(); await releaseChoice.promise;
      return { notificationId: undefined };
    };
    try {
      const beforeChoiceWrites = writes;
      const completing = waitingDialog[2][1].onPress();
      await bounded(enteredChoice.promise);
      await waitingPress();
      await waitingDialog[2][0].onPress();
      waitingDialog[3].onDismiss();
      await waitingPress();
      assert.equal(alerts.length, 1, 'CR-01: lock удерживается до завершения операции');
      assert.equal(writes, beforeChoiceWrites);
      releaseChoice.resolve();
      await bounded(completing);
      assert.equal(writes, beforeChoiceWrites + 1);
    } finally { releaseChoice.resolve(); rescheduleDuringTest = undefined; }
    console.log('CR01_DIALOG_ONCE_OK');

    // CR-03: устаревший тип или дата не разрешают ни удаление, ни перенос.
    for (const isRepeat of [false, true]) {
      for (const change of [{ isRepeat: !isRepeat }, { nextDate: '2026-12-17' }]) {
        const prop = { ...base, isRepeat };
        const current = { ...prop, ...change };
        records = [{ ...current }]; events.length = 0;
        const beforeWrites = writes;
        await checkbox(render(prop))();
        assert.deepEqual(records, [current]);
        assert.equal(writes, beforeWrites);
        assert.deepEqual(events, ['refresh', 'alert']);
        assert.equal(alerts.at(-1)[0], 'Задача изменена');
        await checkbox(render({ ...current }))();
        assert.equal(writes, beforeWrites + 1, 'CR-03: свежие props позволяют новое выполнение');
        if (!current.isRepeat) assert.equal(records.length, 0);
        else assert.equal(records.length, 1);
      }
    }
    // Тип меняется уже после открытия диалога.
    records = [{ ...base }];
    await checkbox(render(base, { isTodoExpired: true }))();
    const staleDialog = alerts.at(-1);
    records[0].isRepeat = false;
    const beforeStaleChoice = writes;
    await staleDialog[2][1].onPress();
    assert.equal(writes, beforeStaleChoice);
    assert.equal(records[0].isRepeat, false);
    // CR-03: одноразовая задача изменена, пока отменяется её уведомление.
    for (const change of [{ nextDate: '2026-12-18' }, { reminderDate: '2026-12-18T15:00:00.000Z' }]) {
      const singleTask = { ...base, isRepeat: false, notificationId: 'single-old', reminderDate: '2026-11-07T15:00:00.000Z' };
      records = [{ ...singleTask }]; events.length = 0;
      const enteredCancel = deferred(), releaseCancel = deferred();
      cancelDuringTest = async () => { enteredCancel.resolve(); await releaseCancel.promise; };
      try {
        const beforeCancelWrites = writes;
        const completing = checkbox(render(singleTask))();
        await bounded(enteredCancel.promise);
        records = [{ ...singleTask, ...change }];
        const edited = structuredClone(records);
        releaseCancel.resolve();
        await bounded(completing);
        assert.deepEqual(records, edited, 'CR-03: актуальная одноразовая задача не удаляется после await');
        assert.equal(writes, beforeCancelWrites);
        assert.deepEqual(events, ['cancel:single-old', 'refresh', 'alert']);
        assert.equal(alerts.at(-1)[0], 'Задача изменена');
      } finally { releaseCancel.resolve(); cancelDuringTest = undefined; }
    }
    console.log('CR03_STALE_TASK_OK');

    // CR-04: реальные getTodo/patchTodo; изменение записи во время await SDK.
    const changes = [
      ['тип', { isRepeat: false }], ['дата', { nextDate: '2026-12-17' }],
      ['частота', { repeatFrequency: 7 }], ['напоминание', { reminderDate: undefined }],
      ['id уведомления', { notificationId: 'edited-id' }],
      ['исходный сценарий', { repeatFrequency: 7, reminderDate: undefined, notificationId: undefined }],
      ['удаление', null], ['несвязанные поля', { title: 'edited', description: 'fresh', size: 2 }],
    ];
    try {
      for (const [label, change] of changes) {
        const initial = { ...base, nextDate: '2026-11-07', reminderDate: '2026-11-07T15:00:00.000Z', notificationId: 'old-id' };
        records = [{ ...initial }]; events.length = 0;
        const entered = deferred(), release = deferred();
        rescheduleDuringTest = async () => {
          events.push('reschedule'); entered.resolve();
          await release.promise;
          return { notificationId: 'orphan-id' };
        };
        const beforeWrites = writes;
        const operation = checkbox(render(initial))();
        await bounded(entered.promise);
        records = change === null ? [] : [{ ...initial, ...change }];
        const edited = structuredClone(records);
        release.resolve();
        await bounded(operation);
        if (label === 'несвязанные поля') {
          assert.equal(writes, beforeWrites + 1);
          assert.equal(records[0].title, 'edited');
          assert.equal(records[0].description, 'fresh');
          assert.equal(records[0].size, 2);
          assert.equal(records[0].nextDate, '2026-11-09');
          assert.equal(records[0].notificationId, 'orphan-id');
          assert.ok(!events.includes('cancel:orphan-id'));
        } else {
          assert.deepEqual(records, edited, 'CR-04: не перезаписывать свежие поля: ' + label);
          assert.equal(writes, beforeWrites);
          assert.deepEqual(events, ['reschedule', 'cancel:orphan-id', 'refresh', 'alert']);
          assert.equal(alerts.at(-1)[0], 'Задача изменена');
        }
      }
      // Контракт canPatch проверяется на реально прочитанной записи, не на props.
      records = [{ ...base, repeatFrequency: 7 }];
      const beforeGuard = writes;
      let observed;
      const rejected = await storage.patchTodo(base.id, { nextDate: '2026-12-20' }, current => {
        observed = current.repeatFrequency;
        return current.repeatFrequency === 2;
      });
      assert.equal(observed, 7);
      assert.equal(rejected, undefined);
      assert.equal(writes, beforeGuard);
      assert.equal(records[0].nextDate, base.nextDate);
      console.log('CR04_CONFLICT_ORPHAN_OK');
    } finally { rescheduleDuringTest = undefined; }
  } finally { Module._load = originalLoad; }
}
async function checkForm() {
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
    // CR-06: независимая правка просроченной задачи не требует переноса даты.
    const overdue = { ...edit, nextDate: time.toDateKey(past) };
    reset(overdue);
    find(node => node.type === 'Input' && node.props.placeholder === 'Добавьте детали...').props.onChangeText('overdue edit');
    await save();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].nextDate, overdue.nextDate);
    assert.equal(saved[0].reminderDate, overdue.reminderDate);
    assert.equal(saved[0].description, 'overdue edit');
    assert.equal(closed, 1);
    reset(overdue); toggle()(false); await save();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].nextDate, overdue.nextDate);
    assert.equal(saved[0].reminderDate, undefined);

    reset(overdue);
    reminderButton().props.onPress();
    find(node => node.type === 'Picker' && node.props.onChange.name === 'onRemindDateChange').props.onChange({ type: 'set' }, new Date(past.getTime() - 86400000));
    await save();
    assert.equal(saved.length, 0); assert.equal(closed, 0);
    assert.ok(find(node => node.type === 'Text' && node.props.children === 'Время напоминания уже прошло'));

    for (const editData of [null, overdue]) {
      reset(editData);
      if (!editData) find(node => node.type === 'Input' && node.props.placeholder === 'Что нужно сделать?').props.onChangeText('new');
      find(node => node.type === 'Button' && node.props.onPress?.toString().includes('setShowDatepicker')).props.onPress();
      find(node => node.type === 'Picker' && node.props.onChange.name === 'onNextDateChange').props.onChange({ type: 'set' }, new Date(past.getTime() - 86400000));
      await save();
      assert.equal(saved.length, 0); assert.equal(closed, 0);
      assert.ok(find(node => node.type === 'Text' && node.props.children === 'Дата не может быть в прошлом'));
    }
    console.log('CR06_OVERDUE_EDIT_OK');
  } finally { Module._load = originalLoad; }
}
checkNotifications().then(checkCompletion).then(checkForm).catch(error => { console.error(error); process.exitCode = 1; });
