import test from 'node:test';
import assert from 'node:assert/strict';
import { DateTime } from 'luxon';
import { eventToday, validateEvent, validateEventImage, MAX_EVENT_IMAGE_BYTES } from '../server/events.js';

const sample = {
  title: 'Cocktail Night', description: 'Een avond met verrassende cocktails en borrelbites.',
  date: '2026-11-28', startTime: '19:30', endTime: '00:30',
  status: 'published', linkUrl: 'https://example.org/tickets'
};

test('events allow an end time after midnight and retain a safe signup link', () => {
  const result = validateEvent(sample);
  assert.equal(result.ok, true);
  assert.equal(result.data.endTime, '00:30');
  assert.equal(result.data.linkUrl, 'https://example.org/tickets');
});

test('events reject invalid dates and links that could run code or contain credentials', () => {
  assert.equal(validateEvent({ ...sample, date: '2026-02-30' }).ok, false);
  assert.equal(validateEvent({ ...sample, linkUrl: 'javascript:alert(1)' }).ok, false);
  assert.equal(validateEvent({ ...sample, linkUrl: 'https://name:pass@example.org/' }).ok, false);
});

test('the public date boundary uses Amsterdam time, including the next day near midnight', () => {
  const instant = DateTime.fromISO('2026-11-11T23:30:00Z').setZone('Europe/Amsterdam');
  assert.equal(eventToday(instant), '2026-11-12');
});

test('event photos reject a mismatched type and files over 2 MB', () => {
  const pngHeader = Buffer.from('89504e470d0a1a0a', 'hex').toString('base64');
  assert.equal(validateEventImage({ mime: 'image/png', data: pngHeader }).ok, true);
  assert.equal(validateEventImage({ mime: 'image/jpeg', data: pngHeader }).ok, false);
  assert.equal(validateEventImage({ mime: 'image/png', data: Buffer.alloc(MAX_EVENT_IMAGE_BYTES + 1).toString('base64') }).ok, false);
});
