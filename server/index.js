import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import mysql from 'mysql2';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookingDateRange, validateBooking } from './booking.js';
import { verifyAdminPassword } from './auth.js';
import { notifyOwner, sendCustomerMessage } from './mail.js';

const required = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
if (process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true
});
const db = pool.promise();
const MySQLStore = MySQLStoreFactory(session);
const store = new MySQLStore({ clearExpired: true, expiration: 24 * 60 * 60 * 1000 }, pool);
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ['https://www.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(express.json({ limit: '12kb' }));
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(session({
  name: 'mellies.sid',
  secret: process.env.SESSION_SECRET,
  store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: 'auto',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function csrf(req) {
  if (!req.session.csrf) req.session.csrf = randomBytes(32).toString('hex');
  if (!req.session.formStarted) req.session.formStarted = Date.now();
  return req.session.csrf;
}
function validCsrf(req) {
  const supplied = req.body?.csrf;
  const expected = req.session.csrf;
  return typeof supplied === 'string' && /^[a-f0-9]{64}$/i.test(supplied) &&
    typeof expected === 'string' && /^[a-f0-9]{64}$/i.test(expected) &&
    timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
function adminOnly(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: 'Log in om reserveringen te beheren.' });
  next();
}

const bookingLimit = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'Te veel aanvragen. Probeer het later opnieuw.' }
});
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5, skipSuccessfulRequests: true,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'Te veel pogingen. Probeer het over 15 minuten opnieuw.' }
});

app.get('/api/health', async (_req, res) => {
  try { await db.query('SELECT 1'); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});
app.get('/api/session', (req, res) => res.json({ csrf: csrf(req), admin: Boolean(req.session.admin), ...bookingDateRange() }));

app.post('/api/reservations', bookingLimit, async (req, res) => {
  if (!validCsrf(req)) return res.status(403).json({ error: 'De sessie is verlopen. Ververs de pagina.' });
  if (req.body.website) return res.status(400).json({ error: 'De aanvraag kon niet worden verwerkt.' });
  if (Date.now() - (req.session.formStarted || Date.now()) < 2000) {
    return res.status(400).json({ error: 'Wacht even en verstuur het formulier opnieuw.' });
  }
  if ((req.session.lastRequest || 0) > Date.now() - 60_000) {
    return res.status(429).json({ error: 'Je hebt zojuist een aanvraag verstuurd. Probeer het over een minuut opnieuw.' });
  }
  const result = validateBooking(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  const { name, email, phone, date, time, guests, note } = result.data;
  try {
    await db.execute(
      'INSERT INTO reservations (name, email, phone, reservation_date, reservation_time, guests, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, date, time, guests, note]
    );
    req.session.lastRequest = Date.now();
    req.session.csrf = randomBytes(32).toString('hex');
    res.status(201).json({ ok: true });
    // Once stored, the request is successful even if mail delivery fails.
    void notifyOwner({ date, time, guests }).catch((error) => console.error('Owner notification failed:', error.message));
  } catch (error) {
    console.error('Reservation storage failed:', error.message);
    res.status(503).json({ error: 'De aanvraag kon niet worden opgeslagen. Probeer het later opnieuw of bel ons.' });
  }
});

app.post('/api/admin/login', loginLimit, async (req, res) => {
  if (!validCsrf(req)) return res.status(403).json({ error: 'De sessie is verlopen. Ververs de pagina.' });
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!await verifyAdminPassword(password, process.env.ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'Inloggen mislukt.' });
  }
  req.session.regenerate((error) => {
    if (error) return res.status(503).json({ error: 'Inloggen is tijdelijk niet beschikbaar.' });
    req.session.admin = true;
    res.json({ ok: true, csrf: csrf(req) });
  });
});
app.post('/api/admin/logout', adminOnly, (req, res) => {
  if (!validCsrf(req)) return res.status(403).json({ error: 'De sessie is verlopen. Ververs de pagina.' });
  req.session.destroy((error) => {
    if (error) return res.status(503).json({ error: 'Uitloggen is mislukt.' });
    res.clearCookie('mellies.sid');
    res.json({ ok: true });
  });
});
app.get('/api/admin/reservations', adminOnly, async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reservations WHERE reservation_date >= CURDATE() - INTERVAL 30 DAY ORDER BY FIELD(status, 'pending','approved','declined'), reservation_date, reservation_time LIMIT 300");
    res.json({ reservations: rows });
  } catch (error) {
    console.error('Reservation list failed:', error.message);
    res.status(503).json({ error: 'Aanvragen laden mislukt.' });
  }
});
app.post('/api/admin/reservations/:id/decision', adminOnly, async (req, res) => {
  if (!validCsrf(req)) return res.status(403).json({ error: 'De sessie is verlopen. Ververs de pagina.' });
  const id = Number(req.params.id);
  const decision = req.body.decision;
  if (!Number.isSafeInteger(id) || id <= 0 || !['approved', 'declined'].includes(decision)) {
    return res.status(400).json({ error: 'Ongeldige beslissing.' });
  }
  let connection;
  let row;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT * FROM reservations WHERE id = ? FOR UPDATE', [id]);
    row = rows[0];
    if (!row || row.status !== 'pending') {
      await connection.rollback();
      return res.status(409).json({ error: 'Deze aanvraag is al behandeld of bestaat niet.' });
    }
    await connection.execute('UPDATE reservations SET status = ? WHERE id = ?', [decision, id]);
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error('Reservation decision failed:', error.message);
    return res.status(503).json({ error: 'Verwerken mislukt.' });
  } finally {
    connection?.release();
  }
  const sent = await sendCustomerMessage(row, decision);
  if (sent) {
    try { await db.execute('UPDATE reservations SET notified_at = NOW() WHERE id = ?', [id]); }
    catch (error) { console.error('Notification timestamp failed:', error.message); }
  }
  res.json({ ok: true, sent, message: sent ? 'Aanvraag verwerkt; e-mail aangeboden aan de mailserver.' : 'Aanvraag verwerkt, maar e-mail is niet verzonden. Bel of mail de gast zelf.' });
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'Niet gevonden.' }));

for (const [oldPath, newPath] of Object.entries({
  '/index.html': '/', '/kaart.html': '/kaart', '/events.html': '/events',
  '/bezoek.html': '/bezoek', '/reserveer.html': '/reserveer',
  '/reserveer.php': '/reserveer', '/privacy.html': '/privacy',
  '/reservations/admin.php': '/admin'
})) app.get(oldPath, (_req, res) => res.redirect(301, newPath));

const root = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(root, '..', 'dist'), { index: false, maxAge: '1h' }));
app.get('/{*path}', (req, res) => {
  if (!['/', '/kaart', '/events', '/bezoek', '/reserveer', '/privacy', '/admin'].includes(req.path)) {
    return res.status(404).send('Pagina niet gevonden');
  }
  res.sendFile(join(root, '..', 'dist', 'index.html'));
});

const port = Number(process.env.PORT || 3000);
try {
  // An empty database is enough: create the reservation table on first start.
  await db.query(await readFile(new URL('../schema.sql', import.meta.url), 'utf8'));
  app.listen(port, '0.0.0.0', () => console.log(`Mellie's webapp listening on ${port}`));
} catch (error) {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
}
