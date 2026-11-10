import nodemailer from 'nodemailer';

function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });
}

export async function notifyOwner(reservation) {
  const transport = mailer();
  if (!transport || !process.env.ADMIN_EMAIL) {
    console.error('Owner mail configuration missing; reservation remains in admin queue');
    return false;
  }
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'Nieuwe aanvraag bij Mellie’s',
      text: `Er is een nieuwe reserveringsaanvraag voor ${reservation.date} om ${reservation.time} voor ${reservation.guests} gasten.\nLog in op het beheerscherm om de aanvraag te beoordelen.\n`
    });
    return true;
  } catch (error) {
    console.error('Owner notification failed:', error.message);
    return false;
  }
}

export async function sendCustomerMessage(reservation, status) {
  const transport = mailer();
  if (!transport) return false;
  const approved = status === 'approved';
  const [year, month, day] = reservation.reservation_date.split('-');
  const date = `${day}-${month}-${year}`;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: reservation.email,
      subject: approved ? 'Je reservering bij Mellie’s is bevestigd' : 'Reactie op je reserveringsaanvraag bij Mellie’s',
      text: `Hoi ${reservation.name},\n\n${approved ? 'Je reservering is bevestigd.' : 'Helaas kunnen we je aanvraag niet bevestigen. Neem gerust contact op voor een ander moment.'}\nDatum: ${date}\nTijd: ${reservation.reservation_time.slice(0, 5)}\nGasten: ${reservation.guests}\n\nMellie’s Drinks & Bites\nDorpsstraat 110H, Zoetermeer\n079 711 35 35`
    });
    return true;
  } catch (error) {
    console.error('Customer notification failed:', error.message);
    return false;
  }
}
