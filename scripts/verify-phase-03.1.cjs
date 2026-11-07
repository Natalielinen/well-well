// Проверки регрессий фазы 03.1 без установки тестового раннера.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
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
