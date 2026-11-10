<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
header('X-Robots-Tag: noindex, nofollow');
$message = '';
if (isset($_GET['logout'])) { $_SESSION = []; session_destroy(); header('Location: admin.php', true, 303); exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $attempts = (int) ($_SESSION['login_attempts'] ?? 0);
    $last = (int) ($_SESSION['last_login_attempt'] ?? 0);
    if ($attempts >= 5 && $last > time() - 900) {
        $message = 'Te veel pogingen. Probeer het over 15 minuten opnieuw.';
    } elseif (hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? '')) && password_verify((string) ($_POST['password'] ?? ''), (string) ($config['admin_password_hash'] ?? ''))) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['login_attempts'] = 0;
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        header('Location: admin.php', true, 303); exit;
    } else {
        $_SESSION['login_attempts'] = $attempts + 1;
        $_SESSION['last_login_attempt'] = time();
        $message = 'Inloggen mislukt.';
    }
}
if (!empty($_SESSION['admin']) && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['decision'])) {
    if (!hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''))) { http_response_code(403); exit('Ongeldige sessie.'); }
    $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
    $decision = (string) $_POST['decision'];
    if ($id && $id > 0 && in_array($decision, ['approved', 'declined'], true)) {
        try {
            $pdo = db(); $pdo->beginTransaction();
            $query = $pdo->prepare('SELECT * FROM reservations WHERE id = ? FOR UPDATE'); $query->execute([$id]); $row = $query->fetch();
            if ($row && $row['status'] === 'pending') {
                $update = $pdo->prepare('UPDATE reservations SET status = ? WHERE id = ?'); $update->execute([$decision, $id]);
                $pdo->commit();
                $sent = sendCustomerMessage($row, $decision);
                if ($sent) { $mark = db()->prepare('UPDATE reservations SET notified_at = NOW() WHERE id = ?'); $mark->execute([$id]); }
                $_SESSION['flash'] = $sent ? 'Aanvraag verwerkt; e-mail aangeboden aan de mailserver.' : 'Aanvraag verwerkt, maar e-mail is niet verzonden. Bel of mail de gast zelf.';
            } else { $pdo->rollBack(); $_SESSION['flash'] = 'Deze aanvraag is al behandeld of bestaat niet.'; }
        } catch (Throwable $e) { if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack(); error_log('Mellies admin action failed: ' . $e->getMessage()); $_SESSION['flash'] = 'Verwerken mislukt.'; }
        header('Location: admin.php', true, 303); exit;
    }
}
$message = $_SESSION['flash'] ?? $message; unset($_SESSION['flash']);
$rows = [];
if (!empty($_SESSION['admin'])) {
    try { $rows = db()->query("SELECT * FROM reservations WHERE reservation_date >= CURDATE() - INTERVAL 30 DAY ORDER BY FIELD(status, 'pending','approved','declined'), reservation_date, reservation_time LIMIT 300")->fetchAll(); }
    catch (Throwable $e) { error_log('Mellies admin list failed: ' . $e->getMessage()); $message = 'Aanvragen laden mislukt.'; }
}
?><!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Reserveringen beheren | Mellie’s</title><link rel="stylesheet" href="../style.css"></head><body><main class="wrap section"><p class="eyebrow">Mellie’s · beheer</p><h1>Reserveringen</h1><?php if ($message): ?><div class="notice" role="status"><?= h($message) ?></div><?php endif; ?>
<?php if (empty($_SESSION['admin'])): ?><form class="booking-form contact admin-login" method="post"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><label>Beheerwachtwoord <input type="password" name="password" required autocomplete="current-password"></label><button class="btn" name="login" value="1">Inloggen</button></form>
<?php else: ?><p><a href="?logout=1">Uitloggen</a> · <a href="../index.html">Naar de website</a></p><p>Bevestig alleen als er plaats is. Neem zelf contact op wanneer de e-mailmelding niet is verzonden.</p><div class="reservation-list">
<?php foreach ($rows as $row): ?><article class="contact reservation"><p class="eyebrow"><?= h($row['status']) ?> · #<?= (int) $row['id'] ?></p><h2><?= h((new DateTimeImmutable($row['reservation_date']))->format('d-m-Y')) ?> om <?= h(substr($row['reservation_time'], 0, 5)) ?></h2><p><strong><?= h($row['name']) ?></strong> · <?= (int) $row['guests'] ?> gasten<br><a href="mailto:<?= h($row['email']) ?>"><?= h($row['email']) ?></a> · <a href="tel:<?= h($row['phone']) ?>"><?= h($row['phone']) ?></a></p><?php if ($row['note']): ?><p><?= nl2br(h($row['note'])) ?></p><?php endif; ?><small>Aangevraagd: <?= h($row['created_at']) ?> · Bericht: <?= $row['notified_at'] ? 'aangeboden aan mailserver' : 'niet verzonden' ?></small>
<?php if ($row['status'] === 'pending'): ?><form class="actions" method="post"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><input type="hidden" name="id" value="<?= (int) $row['id'] ?>"><button class="btn" type="submit" name="decision" value="approved">Bevestigen</button><button class="btn outline" type="submit" name="decision" value="declined">Afwijzen</button></form><?php endif; ?></article><?php endforeach; ?>
<?php if (!$rows): ?><p>Er zijn nog geen aanvragen.</p><?php endif; ?></div><?php endif; ?></main></body></html>
