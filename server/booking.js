import { DateTime } from 'luxon';

const ZONE = 'Europe/Amsterdam';
const invalid = 'Controleer je gegevens, datum en tijd. Reserveren kan vanaf twee uur vooruit tot 90 dagen vooruit, op woensdag 13–18 uur en donderdag t/m zondag 13–22 uur.';

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateBooking(input, now = DateTime.now().setZone(ZONE)) {
  const name = asText(input.name);
  const email = asText(input.email);
  const phone = asText(input.phone);
  const date = asText(input.date);
  const time = asText(input.time);
  const note = asText(input.note);
  const guestValue = input.guests;
  const guests = typeof guestValue === 'string' && /^\d{1,2}$/.test(guestValue)
    ? Number(guestValue)
    : typeof guestValue === 'number' ? guestValue : NaN;
  const slot = DateTime.fromISO(`${date}T${time}`, { zone: ZONE });
  const validSlot = slot.isValid && slot.toFormat('yyyy-MM-dd') === date && slot.toFormat('HH:mm') === time;
  const closing = slot.weekday === 3 ? 18 : 22;

  if (
    name.length < 2 || name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    phone.length < 6 || phone.length > 30 || !/^[+0-9() .-]+$/.test(phone) ||
    !Number.isInteger(guests) || guests < 1 || guests > 20 ||
    note.length > 1000 || !validSlot ||
    slot < now.plus({ hours: 2 }) || slot > now.plus({ days: 90 }) ||
    slot.weekday < 3 || slot.hour < 13 || slot.hour >= closing ||
    ![0, 30].includes(slot.minute)
  ) {
    return { ok: false, error: invalid };
  }

  return { ok: true, data: { name, email, phone, date, time, guests, note } };
}

export function bookingDateRange(now = DateTime.now().setZone(ZONE)) {
  return {
    minDate: now.toFormat('yyyy-MM-dd'),
    maxDate: now.plus({ days: 90 }).toFormat('yyyy-MM-dd')
  };
}
