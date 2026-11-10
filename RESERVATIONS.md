# Reserveringen installeren

De website is een PHP/HTML-site met MySQL. De bezoeker verstuurt een **aanvraag**; alleen de beheerder kan die bevestigen of afwijzen op `/reservations/admin.php`. De module toont geen realtime beschikbaarheid. Zet geen echte persoonsgegevens in GitHub.

## Voor deployment

1. Maak in Hostinger voor deze site een MySQL-database aan. Importeer `reservations/schema.sql` via phpMyAdmin.
2. Maak een wachtwoordhash op een vertrouwde computer: `php -r 'echo password_hash(readline("Wachtwoord: "), PASSWORD_DEFAULT), PHP_EOL;'`. Gebruik een uniek lang wachtwoord; plaats alleen de hash in het configuratiebestand.
3. Kopieer de inhoud van `reservations/config.example.php` naar `mellies-config.php` **één niveau boven de document root** (`public_html`). Vul databasegegevens, hash, Melanies e-mailadres en een geldig afzenderadres van jouw domein in. Dit bestand mag nooit in de repository of `public_html` staan.
4. Deploy de repository naar de document root van de PHP/HTML-website. `reserveer.php` moet door PHP worden uitgevoerd; een statische host of Hostinger AI Builder is hiervoor ongeschikt. HTTPS moet actief zijn.
5. Open `/reserveer.php`, dien een testaanvraag in en controleer de database en het beheerscherm. Bevestig de testaanvraag en controleer of de gastmail echt aankomt (ook spam). De status 'aangeboden aan mailserver' bewijst geen aflevering.

## Beheer

- Log in op `/reservations/admin.php` met het ingestelde wachtwoord. Een aanvraag blijft `pending` totdat je op **Bevestigen** of **Afwijzen** klikt.
- Als mail ontbreekt of faalt, blijft de beslissing opgeslagen en toont het scherm dat de gast zelf gebeld of gemaild moet worden.
- Reserveer capaciteit pas bij bevestiging. De module probeert bij een nieuwe aanvraag de eigenaar te mailen. Controleer het beheerscherm regelmatig: de afhandeling mag niet uitsluitend van e-mail afhangen.
- Bewaar persoonsgegevens niet langer dan nodig. Verwijder oude records via phpMyAdmin of voeg later een bewaartermijn en beheeractie toe. Bijvoorbeeld na een afgesproken termijn: `DELETE FROM reservations WHERE reservation_date < CURRENT_DATE - INTERVAL 6 MONTH;`.
- Openingstijden zijn gebaseerd op de huidige site: woensdag 13–18 uur, donderdag t/m zondag 13–22 uur. Pas de servervalidatie in `reserveer.php` aan wanneer die veranderen.

## Grenzen

Het formulier ondersteunt 1–20 gasten, halfuurslots, aanvragen vanaf twee uur tot 90 dagen vooruit en één aanvraag per browsersessie per minuut. Er is geen koppeling met tafelindeling of agenda. De beheerder moet de aanvraag handmatig behandelen.
