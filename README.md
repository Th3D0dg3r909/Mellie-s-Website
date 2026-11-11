# Mellie’s Drinks & Bites

React/Vite-website met een Node/Express-reserveringsmodule, eventagenda en MySQL. Deze repository is de bron voor de **Web App** op `mellies.td909-creativedesign.nl`. Bij de start worden ontbrekende tabellen `reservations` en `events` uit `schema.sql` aangemaakt; de sessieopslag maakt zelf een tabel `sessions` aan. Bestaande reserveringen en events blijven behouden. Er is geen PHP nodig.

## Hostinger instellen

1. Maak in Hostinger een **Web App (Node.js)** voor `mellies.td909-creativedesign.nl` en koppel deze GitHub-repository aan branch `main`. Kies als root directory `./`.
2. Kies Node.js **22** of **24**, framework **Express** of **Other** als de herkenning niet klopt. Gebruik `npm ci && npm run build` als build-opdracht, `dist` als output directory en `server/index.js` als entry file. Startopdracht is `npm start`. Laat Hostinger de poort instellen.
3. Maak een **nieuwe lege MySQL-database en gebruiker** aan bij de nieuwe website. Zet `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SESSION_SECRET` en `ADMIN_PASSWORD_HASH` in de omgeving van de Node.js-app. Het schema wordt bij de eerste start automatisch aangemaakt. Gebruik `.env.example` als checklist; zet echte waarden nooit in GitHub.
4. Voor e-mails zijn `ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` en `SMTP_FROM` nodig. Voorlopig staat `ADMIN_EMAIL` op `info@td909-creativedesign.nl`. Zonder werkende SMTP blijven aanvragen en beslissingen in de database, maar krijgt niemand een e-mailbericht.
5. Controleer `/api/health`, de site, het reserveringsformulier, `/admin`, een goedkeuring en een afwijzing, en beide e-mailberichten. Voeg ook een conceptevent toe, publiceer het en controleer `/events`. Een aanvraag is pas definitief na goedkeuring door Melanie.

Genereer op je eigen computer een willekeurige sessiesleutel met `openssl rand -hex 32`. Maak voor het beheerscherm een sterk, uniek wachtwoord en sla alleen een bcrypt-hash op in `ADMIN_PASSWORD_HASH` (bijvoorbeeld met het script `npm run hash-admin`). De volledige wachtwoorden gaan niet in de repository of in chatberichten.

## Lokaal ontwikkelen

```sh
npm ci
npm test
npm run build
npm run dev
```

De Vite-frontend draait lokaal op poort 5173. Start de API in een tweede terminal met `npm run dev:api` nadat je een lokale `.env` op basis van `.env.example` hebt ingevuld. De API draait op poort 3000 en gebruikt een lokale MySQL-database.

## Reserveringen

- Bezoekers sturen een **aanvraag**. Alleen een ingelogde beheerder kan die bevestigen of afwijzen op `/admin`.
- Het formulier accepteert 1–20 gasten op halve uren, minimaal twee uur en maximaal 90 dagen vooruit. Woensdag 13:00–18:00 en donderdag t/m zondag 13:00–22:00. Er is geen realtime beschikbaarheidscheck.
- Bij een nieuwe aanvraag krijgt de beheerder een melding. Bij een beslissing krijgt de gast een bericht. Als een mail niet wordt verzonden, toont het beheerscherm dat de gast zelf gebeld of gemaild moet worden. Controleer de aanvragen regelmatig.
- De website blijft voorlopig `noindex`. Controleer het definitieve e-mailadres, openingstijden, prijzen en privacytekst voordat Mellie’s publiek wordt gelanceerd.

Sessies worden in MySQL bewaard. CSRF, een onzichtbaar spamveld, tijdscontrole, rate limiting, HTTPS-cookies en invoervalidatie beschermen de reserveringsroutes. Bewaar persoonsgegevens niet langer dan nodig; stel een bewaartermijn vast voor de publieke lancering.

## Events beheren

- Log in op `/admin` met het beheerwachtwoord en kies **Events**. Met **Nieuw event** of **Bewerken** beheert Melanie titel, datum, starttijd, optionele eindtijd, omschrijving, aanmeldlink en poster/foto.
- Bewaar als **Concept** om het event verborgen te houden. **Gepubliceerd** zet het meteen op `/events`. Komende events staan per maand op datum oplopend; eerdere gepubliceerde events staan onderaan, nieuwste eerst (maximaal 24).
- De foto is optioneel: JPG, PNG of WebP, maximaal 2 MB. Foto's staan in MySQL, zodat een nieuwe GitHub-deploy ze niet overschrijft. Zonder foto gebruikt de website een vormgegeven affiche.
- Een optionele aanmeldlink moet met `https://` beginnen. Zonder link leidt de eventkaart naar het reserveringsformulier. Bij verwijderen verdwijnt ook de opgeslagen foto definitief.
