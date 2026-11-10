<?php
declare(strict_types=1);
date_default_timezone_set('Europe/Amsterdam');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ini_set('session.cookie_secure', '1');
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$_SESSION['form_started'] ??= time();

$configPath = dirname(__DIR__, 2) . '/mellies-config.php';
if (!is_file($configPath)) { http_response_code(503); exit('Reserveringen zijn tijdelijk niet beschikbaar.'); }
$config = require $configPath;
if (!is_array($config)) { http_response_code(503); exit('Reserveringen zijn tijdelijk niet beschikbaar.'); }
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function db(): PDO {
    global $config;
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4', $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    }
    return $pdo;
}
function sendCustomerMessage(array $reservation, string $status): bool {
    global $config;
    if (empty($config['mail_from']) || !filter_var($config['mail_from'], FILTER_VALIDATE_EMAIL)) return false;
    $date = (new DateTimeImmutable($reservation['reservation_date']))->format('d-m-Y');
    $approved = $status === 'approved';
    $subject = $approved ? 'Je reservering bij Mellie’s is bevestigd' : 'Reactie op je reserveringsaanvraag bij Mellie’s';
    $body = "Hoi " . $reservation['name'] . ",\n\n" . ($approved ? 'Je reservering is bevestigd.' : 'Helaas kunnen we je aanvraag niet bevestigen. Neem gerust contact op voor een ander moment.') . "\nDatum: $date\nTijd: " . substr($reservation['reservation_time'], 0, 5) . "\nGasten: " . $reservation['guests'] . "\n\nMellie’s Drinks & Bites\nDorpsstraat 110H, Zoetermeer\n079 711 35 35";
    if (preg_match('/[\r\n]/', $reservation['email'])) return false;
    return mail($reservation['email'], mb_encode_mimeheader($subject, 'UTF-8'), $body, 'From: ' . $config['mail_from'] . "\r\nContent-Type: text/plain; charset=UTF-8");
}
function notifyOwner(array $reservation): void {
    global $config;
    if (empty($config['admin_email']) || !filter_var($config['admin_email'], FILTER_VALIDATE_EMAIL)
        || empty($config['mail_from']) || !filter_var($config['mail_from'], FILTER_VALIDATE_EMAIL)) return;
    $body = "Er is een nieuwe reserveringsaanvraag voor " . $reservation['reservation_date'] . ' om ' . $reservation['reservation_time'] . ' voor ' . $reservation['guests'] . " gasten.\nLog in op het beheerscherm om de aanvraag te beoordelen.\n";
    if (!mail($config['admin_email'], mb_encode_mimeheader('Nieuwe aanvraag bij Mellie’s', 'UTF-8'), $body, 'From: ' . $config['mail_from'] . "\r\nContent-Type: text/plain; charset=UTF-8")) {
        error_log('Mellies owner notification not accepted by mail server');
    }
}
