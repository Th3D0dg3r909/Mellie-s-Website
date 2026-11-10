import test from 'node:test';
import assert from 'node:assert/strict';
import { DateTime } from 'luxon';
import { validateBooking, bookingDateRange } from '../server/booking.js';

const now = DateTime.fromISO('2026-11-10T12:00:00', { zone: 'Europe/Amsterdam' });
const good = { name: 'Robin Test', email: 'robin@example.com', phone: '+31 6 1234 5678', date: '2026-11-11', time: '13:30', guests: 2, note: '' };

test('accepts Wednesday half-hour slot and keeps original SQL field names', () => {
  assert.deepEqual(validateBooking(good, now), { ok: true, data: good });
});
test('rejects closed days, closing time, invalid guests and forged dates', () => {
  for (const change of [
    { date: '2026-11-09' }, { date: '2026-11-11', time: '18:00' },
    { date: '2026-11-11', time: '13:15' }, { guests: 21 },
    { date: '2026-02-30' }, { email: 'not-an-email' }
  ]) assert.equal(validateBooking({ ...good, ...change }, now).ok, false);
});
test('requires two hours notice and caps requests at ninety days', () => {
  assert.equal(validateBooking({ ...good, date: '2026-11-10', time: '13:30' }, now).ok, false);
  assert.equal(validateBooking({ ...good, date: '2027-03-05' }, now).ok, false);
  assert.deepEqual(bookingDateRange(now), { minDate: '2026-11-10', maxDate: '2027-02-08' });
});
