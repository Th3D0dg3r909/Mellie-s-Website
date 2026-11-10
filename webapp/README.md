# Mellie’s webapp

React + Vite voor de site, Express voor de reserveringen en het beheer, MySQL voor dezelfde reserveringstabel als in de huidige PHP-site. Dit is een losstaande conceptversie. De bestaande website blijft op de GitHub-hoofdbranch staan totdat de nieuwe webapp op een tijdelijke URL is getest.

## Lokaal

```sh
cd webapp
npm ci
npm test
npm run build
npm start
```

Voor de backend zijn omgevingsvariabelen nodig. Gebruik `.env.example` als checklist en zet echte waarden alleen in lokale, genegeerde `.env` of Hostinger Node.js environment variables. De databasekolommen zijn gelijk aan `reservations/schema.sql` in de bovenliggende repository. Voor lokale ontwikkeling: `npm run dev:api` naast `npm run dev` (Vite op poort 5173, API op poort 3000).

## Hostinger proefplaatsing

1. Maak een **aparte Node.js-webapp** op een tijdelijke Hostinger-subdomein. Verplaats `mellies.td909-creativedesign.nl` nu nog niet. Verbind de GitHub-branch met de projectdirectory `webapp`. Build: `npm ci && npm run build`; start: `npm start` (entry `server/index.js`). Laat Hostinger `PORT` invullen.
2. Maak eerst een export van de bestaande MySQL-reserveringstabel. Controleer op welke hostingomgeving de nieuwe app draait; als de bestaande database daar niet rechtstreeks bereikbaar is, importeer de export naar een nieuwe MySQL-database. Gebruik in de app de nieuwe databasegegevens. De PHP-configuratie boven `public_html` gaat niet automatisch mee.
3. Zet `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME`, `DB_USER` en `DB_PASSWORD` in de Node.js-omgeving. Kopieer de bestaande **bcrypt hash**, niet het wachtwoord zelf, naar `ADMIN_PASSWORD_HASH`; de PHP `$2y$`-hash wordt door de app gecontroleerd als dezelfde bcrypt-variant. Genereer een nieuwe willekeurige `SESSION_SECRET` van minstens 32 tekens. Geen secrets in GitHub.
4. Voor meldingen: `ADMIN_EMAIL=info@td909-creativedesign.nl`, `SMTP_HOST`, `SMTP_PORT` (meestal 465), `SMTP_SECURE=true`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. De afzender moet bij de mailbox passen. Zonder werkende SMTP blijven aanvragen bewaard en besluiten zichtbaar, maar worden er **geen e-mails verzonden**.
5. Test op de tijdelijke URL: alle pagina’s, mobiel, `/api/health`, een proefaanvraag, een ongeldige tijd, inloggen op `/admin`, goedkeuren en afwijzen, de e-mail aan beheerder en gast, en of de databasewaarden juist worden bijgewerkt. Gebruik geen echte persoonsgegevens bij de test.
6. Maak vlak voor de omschakeling opnieuw een database-export, voorkom nieuwe aanvragen in de korte overgang en controleer dat de laatste aanvragen in de nieuwe database staan. Koppel daarna pas het echte subdomein aan de Node.js-webapp en verifieer SSL, redirects en een complete reserveringsronde. Verwijder de oude PHP-website en database pas wanneer back-up en nieuwe site aantoonbaar werken; het verwijderen van een Hostinger-website kan gekoppelde gegevens raken.

## Gedrag

- De bezoeker doet een **aanvraag**, geen directe reservering. Alleen de beheerder kan `pending` naar `approved` of `declined` wijzigen.
- De app accepteert 1–20 gasten op halve uren, minimaal twee uur en maximaal 90 dagen vooruit. Woensdag 13:00–18:00 en donderdag t/m zondag 13:00–22:00. Er is geen realtime beschikbaarheidscheck.
- Een oude URL als `/reserveer.php` of `/reservations/admin.php` leidt op de webapp naar de nieuwe pagina. Bestaande PHP-sessies verhuizen niet mee; de beheerder logt opnieuw in.
- Het concept blijft `noindex`. Controleer inhoud, menuprijzen, openingstijden, privacytekst en definitief e-mailadres voor de publieke lancering.

## Beveiliging en opslag

De admin gebruikt hetzelfde bestaande bcrypt wachtwoordhashformaat. Sessies staan in een MySQL-tabel `sessions`, aangemaakt door de session store. Formulieren gebruiken CSRF, een honeypot, tijdscontrole en rate limiting; cookies zijn op productie-HTTPS alleen via HTTPS beschikbaar. Wachtwoorden en SMTP-gegevens blijven in Hostinger environment variables. Voor archivering of verwijdering van oude aanvragen geldt hetzelfde beleid als in `RESERVATIONS.md`.
