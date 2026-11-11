import { DateTime } from 'luxon';

const ZONE = 'Europe/Amsterdam';
export const MAX_EVENT_IMAGE_BYTES = 2 * 1024 * 1024;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validTime(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function eventToday(now = DateTime.now().setZone(ZONE)) {
  return now.toFormat('yyyy-MM-dd');
}

export function validateEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Vul de eventgegevens in.' };
  }
  const title = text(input.title);
  const description = text(input.description);
  const date = text(input.date);
  const startTime = text(input.startTime);
  const endTime = text(input.endTime);
  const linkUrl = text(input.linkUrl);
  const status = input.status;
  const day = DateTime.fromISO(date, { zone: ZONE });
  if (
    title.length < 3 || title.length > 140 ||
    description.length < 10 || description.length > 3000 ||
    !day.isValid || day.toFormat('yyyy-MM-dd') !== date ||
    !validTime(startTime) || (endTime && !validTime(endTime)) ||
    (endTime && endTime === startTime) ||
    !['draft', 'published'].includes(status)
  ) {
    return { ok: false, error: 'Controleer titel, omschrijving, datum, tijden en publicatiestatus.' };
  }

  let safeLink = null;
  if (linkUrl) {
    try {
      const url = new URL(linkUrl);
      if (url.protocol !== 'https:' || url.username || url.password || linkUrl.length > 1000) throw new Error('invalid');
      safeLink = url.href;
    } catch {
      return { ok: false, error: 'Gebruik voor de aanmeldlink een volledige https-link.' };
    }
  }
  return {
    ok: true,
    data: { title, description, date, startTime, endTime: endTime || null, linkUrl: safeLink, status }
  };
}

export function validateEventImage(image) {
  if (image == null) return { ok: true, data: null };
  if (!image || typeof image !== 'object' || Array.isArray(image) ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(image.mime) ||
      typeof image.data !== 'string' ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data)) {
    return { ok: false, error: 'Gebruik een JPG-, PNG- of WebP-foto.' };
  }
  if (image.data.length > Math.ceil(MAX_EVENT_IMAGE_BYTES / 3) * 4) {
    return { ok: false, error: 'De foto mag maximaal 2 MB zijn.' };
  }
  const bytes = Buffer.from(image.data, 'base64');
  if (bytes.length === 0 || bytes.length > MAX_EVENT_IMAGE_BYTES) {
    return { ok: false, error: 'De foto mag maximaal 2 MB zijn.' };
  }
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const webp = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!(image.mime === 'image/jpeg' && jpeg || image.mime === 'image/png' && png || image.mime === 'image/webp' && webp)) {
    return { ok: false, error: 'De inhoud van de foto komt niet overeen met het bestandsformaat.' };
  }
  return { ok: true, data: { mime: image.mime, bytes } };
}
