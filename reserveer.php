<?php
declare(strict_types=1);
require __DIR__ . '/reservations/bootstrap.php';

$error = '';
$old = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old = $_POST;
    if (!hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''))) {
        $error = 'De sessie is verlopen. Probeer het opnieuw.';
    } elseif (!empty($_POST['website'])) {
        $error = 'De aanvraag kon niet worden verwerkt.';
    } elseif (time() - (int) ($_SESSION['form_started'] ?? time()) < 2) {
        $error = 'Wacht even en verstuur het formulier opnieuw.';
    } elseif ((int) ($_SESSION['last_request'] ?? 0) > time() - 60) {
        $error = 'Je hebt zojuist een aanvraag verstuurd. Probeer het over een minuut opnieuw.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $date = (string) ($_POST['date'] ?? '');
        $time = (string) ($_POST['time'] ?? '');
        $guests = filter_var($_POST['guests'] ?? null, FILTER_VALIDATE_INT);
        $note = trim((string) ($_POST['note'] ?? ''));
        $slot = DateTimeImmutable::createFromFormat('!Y-m-d H:i', $date . ' ' . $time, new DateTimeZone('Europe/Amsterdam'));
        $now = new DateTimeImmutable('now', new DateTimeZone('Europe/Amsterdam'));
        $day = $slot ? (int) $slot->format('N') : 0;
        $hour = $slot ? (int) $slot->format('G') : 0;
        $minute = $slot ? (int) $slot->format('i') : -1;
        $closing = $day === 3 ? 18 : 22;
        if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL)
            || strlen($email) > 254 || strlen($phone) < 6 || strlen($phone) > 30
            || !preg_match('/^[+0-9() .-]+$/', $phone) || $guests === false || $guests < 1 || $guests > 20
            || mb_strlen($note) > 1000 || !$slot || $slot->format('Y-m-d H:i') !== $date . ' ' . $time
            || $slot < $now->modify('+2 hours') || $slot > $now->modify('+90 days')
            || $day < 3 || $hour < 13 || $hour >= $closing || !in_array($minute, [0, 30], true)) {
            $error = 'Controleer je gegevens, datum en tijd. Reserveren kan vanaf twee uur vooruit tot 90 dagen vooruit, op woensdag 13–18 uur en donderdag t/m zondag 13–22 uur.';
        } else {
            try {
                $stmt = db()->prepare('INSERT INTO reservations (name, email, phone, reservation_date, reservation_time, guests, note) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$name, $email, $phone, $date, $time, $guests, $note]);
                try { notifyOwner(['name' => $name, 'reservation_date' => $date, 'reservation_time' => $time, 'guests' => $guests]); }
                catch (Throwable $mailError) { error_log('Mellies owner notification failed: ' . $mailError->getMessage()); }
                $_SESSION['last_request'] = time();
                $_SESSION['csrf'] = bin2hex(random_bytes(32));
                header('Location: /reserveer.php?verstuurd=1', true, 303);
                exit;
            } catch (Throwable $e) {
                error_log('Mellies reservation insert failed: ' . $e->getMessage());
                $error = 'De aanvraag kon niet worden opgeslagen. Probeer het later opnieuw of bel ons.';
            }
        }
    }
}
$minDate = (new DateTimeImmutable('today', new DateTimeZone('Europe/Amsterdam')))->format('Y-m-d');
$maxDate = (new DateTimeImmutable('+90 days', new DateTimeZone('Europe/Amsterdam')))->format('Y-m-d');
function value(string $key, array $old): string { return h((string) ($old[$key] ?? '')); }
?>
<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><meta name="theme-color" content="#080b2b"><title>Reserveren | Mellie’s Drinks &amp; Bites</title><link rel="icon" href="assets/pick.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css?v=20261110-5"><style>.trap{position:absolute!important;width:1px;height:1px;overflow:hidden;left:-10000px}.booking-form{display:grid;gap:15px;max-width:560px}.booking-form label{display:grid;gap:5px}.booking-form input,.booking-form select,.booking-form textarea{width:100%;min-height:44px;padding:9px 12px;background:#080b2b;color:#f9e4c1;border:1px solid #a68070;font:inherit}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:480px){.form-row{grid-template-columns:1fr}}</style></head><body>
<a class="skip" href="#inhoud">Direct naar inhoud</a><header class="head"><div class="wrap nav"><a class="mark" href="index.html"><img src="assets/pick.svg" width="32" height="32" alt=""><span><strong>Mellie’s</strong><small>Drinks &amp; Bites</small></span></a><nav aria-label="Hoofdnavigatie"><a href="index.html">Home</a><a href="kaart.html">De kaart</a><a href="events.html">Events</a><a href="bezoek.html">Bezoek</a><a href="reserveer.php" aria-current="page" class="btn">Reserveer</a></nav></div></header>
<main id="inhoud"><section class="page-head"><div class="wrap"><p class="eyebrow">Reserveren</p><h1>Jouw tafel <em>wacht op je.</em></h1><p>Kies een moment en vertel met hoeveel mensen je komt. Melanie beoordeelt je aanvraag. Je reservering is pas definitief na haar bevestiging.</p></div></section><section class="wrap section two"><div><p class="eyebrow">Je aanvraag</p><h2>Schuif je aan?</h2>
<?php if (isset($_GET['verstuurd'])): ?><div class="notice success" role="status"><strong>Aanvraag ontvangen.</strong><p>Melanie bekijkt je verzoek. Je hebt nog geen bevestigde reservering; neem bij spoed telefonisch contact op.</p></div>
<?php else: ?><?php if ($error): ?><div class="notice" role="alert"><?= h($error) ?></div><?php endif; ?>
<form class="booking-form" method="post" action="/reserveer.php"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><div class="trap" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
<label>Naam <input required maxlength="100" name="name" autocomplete="name" value="<?= value('name', $old) ?>"></label><label>E-mailadres <input required type="email" maxlength="254" name="email" autocomplete="email" value="<?= value('email', $old) ?>"></label><label>Telefoonnummer <input required type="tel" maxlength="30" name="phone" autocomplete="tel" value="<?= value('phone', $old) ?>"></label>
<div class="form-row"><label>Datum <input required type="date" name="date" min="<?= $minDate ?>" max="<?= $maxDate ?>" value="<?= value('date', $old) ?>"></label><label>Tijd <select required name="time"><option value="">Kies een tijd</option><?php for ($i = 26; $i < 44; $i++): $t = sprintf('%02d:%02d', intdiv($i, 2), ($i % 2) * 30); ?><option value="<?= $t ?>" <?= ($old['time'] ?? '') === $t ? 'selected' : '' ?>><?= $t ?></option><?php endfor; ?></select></label></div>
<label>Aantal gasten <input required type="number" name="guests" min="1" max="20" value="<?= value('guests', $old) ?>"></label><label>Opmerking (optioneel) <textarea name="note" maxlength="1000" rows="4"><?= value('note', $old) ?></textarea></label><p class="form-hint">Woensdag 13:00–18:00 · donderdag t/m zondag 13:00–22:00. We gebruiken je gegevens alleen om je aanvraag te behandelen.</p><button class="btn" type="submit">Verstuur aanvraag</button></form><?php endif; ?></div>
<div class="contact"><p class="eyebrow">Vragen?</p><h2>Neem contact op.</h2><p>Een aanvraag is nog geen reservering. Bel ons als je snel duidelijkheid nodig hebt.</p><div class="actions"><a class="btn outline" href="tel:+31797113535">Bel ons</a></div></div></section></main><footer class="foot"><div class="wrap"><small>Mellie’s Drinks &amp; Bites · Dorpsstraat 110H · Zoetermeer</small><div class="foot-links"><a href="tel:+31797113535">079 711 35 35</a><a href="privacy.html">Privacy</a></div></div></footer></body></html>
