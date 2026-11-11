import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  ImagePlus,
  MapPin,
  Menu,
  Phone,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { menu } from "./menu.js";
import "./style.css";

const A = "/assets/";
const phone = "tel:+31797113535";
const whatsapp = "https://wa.me/31797113535";
const address = "Dorpsstraat 110H · 2712 AM Zoetermeer";
const nav = [
  ["/", "Home"],
  ["/kaart", "De kaart"],
  ["/events", "Events"],
  ["/bezoek", "Bezoek"],
];
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.65, ease: "easeOut" },
};

function ArrowLink({ to, children, dark = false }) {
  return (
    <Link className={`button ${dark ? "button--dark" : ""}`} to={to}>
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return (
    <header className="header">
      <div className="shell header__inner">
        <Link
          className="brand"
          to="/"
          aria-label="Mellie’s Drinks & Bites, naar home"
        >
          <img
            src={A + "mellies-logo.jpg"}
            width="150"
            height="62"
            alt="Mellie’s Drinks & Bites"
          />
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Sluit menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
        <nav
          id="site-nav"
          className={`navigation ${open ? "navigation--open" : ""}`}
          aria-label="Hoofdnavigatie"
        >
          {nav.map(([to, label]) => (
            <NavLink end key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/reserveer" className="nav-book">
            Reserveer <ArrowUpRight size={16} aria-hidden="true" />
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div>
          <p className="eyebrow">Nog één rondje?</p>
          <h2>
            Tot <em>zo.</em>
          </h2>
          <ArrowLink to="/reserveer">Vraag een tafel aan</ArrowLink>
        </div>
        <div>
          <p className="eyebrow">Kom langs</p>
          <address>{address}</address>
          <a href={phone}>079 711 35 35</a>
          <Link to="/bezoek">
            Openingstijden & route <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="shell footer__bottom">
        <span>© {new Date().getFullYear()} Mellie’s Drinks & Bites</span>
        <div>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

function Ribbon() {
  return (
    <div
      className="ribbon"
      aria-label="Cocktails, borrelplanken, lokaal bier en goed gezelschap"
    >
      <div className="ribbon__track" aria-hidden="true">
        {[0, 1].map((n) => (
          <span key={n}>
            COCKTAILS <b>✳</b> BORRELPLANKEN <b>✳</b> LOKAAL BIER <b>✳</b>{" "}
            GOED GEZELSCHAP <b>✳</b>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="shell home-hero__grid">
          <motion.div
            className="home-hero__copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="eyebrow">Cocktails · bites · Zoetermeer</p>
            <h1>
              Schuif
              <br />
              <span>aan.</span>
              <br />
              <em>Blijf hangen.</em>
            </h1>
            <p className="hero-lead">
              Een borrel in de Dorpsstraat, met goede cocktails en iets lekkers
              om te delen. Bij Melanie ben je welkom.
            </p>
            <div className="actions">
              <ArrowLink to="/reserveer">Vraag een tafel aan</ArrowLink>
              <Link className="text-link" to="/kaart">
                Ontdek de kaart <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
          <div className="home-hero__visual">
            <motion.div
              className="hero-picture"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <img
                src={A + "aperol.jpg"}
                alt="Aperol Spritz op tafel bij Mellie’s"
                fetchPriority="high"
              />
            </motion.div>
            <div className="hero-disc" aria-hidden="true">
              <span>
                GOOD
                <br />
                DRINKS
                <br />
                GOOD
                <br />
                TIMES
              </span>
              <span>✳</span>
            </div>
            <div className="hero-caption">
              01 / Een plek om te blijven hangen
            </div>
          </div>
        </div>
        <div className="hero-bottom shell">
          <span>Zoetermeer · Dorpsstraat 110H</span>
          <a href="#welkom" aria-label="Scroll naar welkom">
            <ArrowDownRight size={24} />
          </a>
        </div>
      </section>
      <Ribbon />
      <section className="shell intro-section" id="welkom">
        <motion.div {...reveal}>
          <p className="eyebrow">Welkom bij Mellie’s</p>
          <h2>
            Kom binnen.
            <br />
            <em>Blijf nog even.</em>
          </h2>
        </motion.div>
        <motion.div {...reveal}>
          <p>
            Mellie’s wordt gerund door Melanie. Hier draait het om samen
            genieten: een borrelplank op tafel, een goede cocktail in je hand en
            tijd voor elkaar.
          </p>
          <Link className="text-link" to="/bezoek">
            Leer ons kennen <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </motion.div>
      </section>
      <section className="shell explore-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">Van de bar</p>
            <h2>
              Wat mag het <em>zijn?</em>
            </h2>
          </div>
          <Link className="text-link" to="/kaart">
            De hele kaart <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="explore-grid">
          <motion.div {...reveal}>
            <Link
              className="explore-card explore-card--large"
              to="/kaart#cocktails"
            >
              <img
                src={A + "mojito.jpg"}
                alt="Mojito cocktail"
                loading="lazy"
              />
              <span>
                <small>01 / Drinks</small>
                <strong>Cocktails</strong>
                <ArrowUpRight size={28} aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
          <motion.div {...reveal}>
            <Link
              className="explore-card explore-card--small"
              to="/kaart#planken"
            >
              <img
                src={A + "splitje.jpg"}
                alt="Splitje cocktail"
                loading="lazy"
              />
              <span>
                <small>02 / Bites</small>
                <strong>Om te delen</strong>
                <ArrowUpRight size={28} aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
          <motion.div {...reveal} className="explore-note">
            <span className="squiggle" aria-hidden="true">
              ✳
            </span>
            <p>Een tafel voor jou?</p>
            <h3>De beste avonden beginnen met “nog eentje”.</h3>
            <ArrowLink to="/reserveer" dark>
              Reserveer
            </ArrowLink>
          </motion.div>
        </div>
      </section>
      <section className="events-feature">
        <div className="shell events-feature__grid">
          <motion.div {...reveal} className="events-feature__image">
            <img
              src={A + "mellies-events.jpg"}
              loading="lazy"
              alt="Drinks & Bites by Mellie’s"
            />
          </motion.div>
          <motion.div {...reveal}>
            <p className="eyebrow">Drinks & Bites by Mellie’s</p>
            <h2>
              Er is altijd
              <br />
              <em>iets te vieren.</em>
            </h2>
            <p>
              Volg het eventnieuws of neem contact op als je iets te vieren
              hebt.
            </p>
            <ArrowLink to="/events">Bekijk de events</ArrowLink>
          </motion.div>
        </div>
      </section>
      <section className="shell visit-strip">
        <div>
          <p className="eyebrow">Bezoek ons</p>
          <h2>
            Tot aan <em>de bar.</em>
          </h2>
        </div>
        <div>
          <p>
            Woensdag <span>13:00–18:00</span>
          </p>
          <p>
            Donderdag t/m zondag <span>13:00–22:00</span>
          </p>
          <p>
            Maandag en dinsdag <span>Gesloten</span>
          </p>
          <Link className="text-link" to="/bezoek">
            Route & contact <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

function PageHero({ eyebrow, title, accent, children, image }) {
  return (
    <section className="page-hero">
      <div className="shell page-hero__grid">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">{eyebrow}</p>
          <h1>
            {title}
            {accent && (
              <>
                <br />
                <em>{accent}</em>
              </>
            )}
          </h1>
          <p className="page-hero__lead">{children}</p>
        </motion.div>
        {image && (
          <motion.img
            initial={{ opacity: 0, rotate: 5 }}
            animate={{ opacity: 1, rotate: -3 }}
            transition={{ duration: 0.8 }}
            className="page-hero__image"
            src={A + image}
            alt=""
          />
        )}
      </div>
    </section>
  );
}

function CardList({ group }) {
  return (
    <section className="menu-section" id={group.id}>
      <div className="menu-section__heading">
        <p className="eyebrow">
          {group.id === "planken" ||
          group.id === "bites" ||
          group.id === "sides"
            ? "Bites"
            : "Drinks"}
        </p>
        <h2>{group.title}</h2>
        <p>{group.intro}</p>
      </div>
      <div className="menu-rows">
        {group.items.map(([name, description, price]) => (
          <article className="menu-row" key={name + group.id}>
            <div>
              <h3>{name}</h3>
              {description && <p>{description}</p>}
            </div>
            <strong>{price}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardMenu() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    requestAnimationFrame(() =>
      document.getElementById(location.hash.slice(1))?.scrollIntoView(),
    );
  }, [location.hash]);
  return (
    <>
      <PageHero
        eyebrow="Drinks & Bites"
        title="Jouw avond."
        accent="Jouw smaak."
        image="splitje.jpg"
      >
        Cocktails, borrelplanken en bites om samen van te genieten. Ontdek wat
        er bij Mellie’s op tafel komt.
      </PageHero>
      <div className="shell menu-layout">
        <aside className="menu-index">
          <p className="eyebrow">Blader door de kaart</p>
          {menu.map((g) => (
            <a key={g.id} href={`#${g.id}`}>
              {g.title}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
          <p className="menu-index__note">
            Vragen over allergenen? Spreek ons team aan.
          </p>
        </aside>
        <div>
          {menu.map((group) => (
            <CardList key={group.id} group={group} />
          ))}
          <div className="menu-outro">
            <h2>
              Al iets op het <em>oog?</em>
            </h2>
            <ArrowLink to="/reserveer" dark>
              Vraag een tafel aan
            </ArrowLink>
          </div>
        </div>
      </div>
    </>
  );
}

function eventDate(date, options) {
  return new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", ...options })
    .format(new Date(`${date}T12:00:00Z`));
}

function EventCard({ event, past = false }) {
  const image = event.hasImage && `/api/events/${event.id}/image?v=${encodeURIComponent(event.updatedAt)}`;
  return (
    <article className={`event-card ${past ? "event-card--past" : ""}`} id={`event-${event.id}`}>
      <div className="event-card__date" aria-label={eventDate(event.date, { dateStyle: "full" })}>
        <strong>{eventDate(event.date, { day: "2-digit" })}</strong>
        <span>{eventDate(event.date, { month: "short" })}</span>
        <small>{eventDate(event.date, { year: "numeric" })}</small>
      </div>
      <div className="event-card__content">
        <p className="eyebrow">Drinks & Bites by Mellie’s</p>
        <h3>{event.title}</h3>
        <p className="event-card__when">
          <CalendarDays size={18} aria-hidden="true" /> {eventDate(event.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          <span aria-hidden="true">·</span>
          <Clock3 size={18} aria-hidden="true" /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""} uur
        </p>
        <p className="event-card__description">{event.description}</p>
        {!past && (event.linkUrl ? (
          <a className="text-link" href={event.linkUrl} target="_blank" rel="noopener noreferrer">
            Meer info / aanmelden <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        ) : (
          <Link className="text-link" to="/reserveer">
            Vraag een tafel aan <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <div className={`event-card__visual ${image ? "" : "event-card__visual--graphic"}`}>
        {image ? <img src={image} alt={`Poster of foto bij ${event.title}`} loading="lazy" /> : (
          <span aria-hidden="true">GOOD<br />TIMES<span>✳</span></span>
        )}
      </div>
    </article>
  );
}

function Events() {
  const [agenda, setAgenda] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/api/events").then(setAgenda).catch((e) => setError(e.message));
  }, []);
  const months = [];
  for (const event of agenda?.upcoming || []) {
    const key = event.date.slice(0, 7);
    if (months.at(-1)?.key !== key) months.push({ key, events: [] });
    months.at(-1).events.push(event);
  }
  return (
    <>
      <PageHero
        eyebrow="Events · Zoetermeer"
        title="De avond is"
        accent="nog jong."
        image="mellies-events.jpg"
      >
        Een goede avond krijgt een datum. Ontdek wat er binnenkort bij Melanie
        aan de bar gebeurt.
      </PageHero>
      <section className="shell event-agenda">
        <div className="event-agenda__intro">
          <div>
            <p className="eyebrow">De agenda</p>
            <h2>Dit wil je <em>niet missen.</em></h2>
          </div>
          <p>Van een spontane borrel tot een avond die je alvast vrijhoudt. Hier staan de events in volgorde van datum.</p>
        </div>
        {!agenda && !error && <p role="status">Agenda laden…</p>}
        {error && <p className="feedback" role="alert">{error} Bel ons gerust voor de actuele agenda.</p>}
        {months.map(({ key, events }) => (
          <div className="event-month" key={key}>
            <div className="event-month__heading"><span>{eventDate(events[0].date, { month: "long", year: "numeric" })}</span><span>{String(events.length).padStart(2, "0")} {events.length === 1 ? "event" : "events"}</span></div>
            <div className="event-timeline">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
          </div>
        ))}
        {agenda && !agenda.upcoming.length && (
          <div className="event-empty">
            <span aria-hidden="true">✳</span>
            <div>
              <p className="eyebrow">Binnenkort meer</p>
              <h3>De volgende ronde komt eraan.</h3>
              <p>Er is nog geen nieuwe datum aangekondigd. Kom gezellig langs of vraag Melanie wat er op de planning staat.</p>
              <a className="text-link" href={whatsapp} target="_blank" rel="noopener noreferrer">Vraag het via WhatsApp <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        )}
        {agenda?.past.length > 0 && (
          <div className="event-past">
            <p className="eyebrow">Eerder bij Mellie’s</p>
            <h2>Wat hebben we <em>gevierd?</em></h2>
            <div className="event-timeline">{agenda.past.map((event) => <EventCard event={event} past key={event.id} />)}</div>
          </div>
        )}
      </section>
      <section className="event-contact">
        <div className="shell event-contact__inner">
          <div><p className="eyebrow">Jouw avond bij ons?</p><h2>Maak er <em>iets moois van.</em></h2></div>
          <div><p>Zelf iets te vieren of benieuwd naar de volgende editie? Laat van je horen.</p><div className="actions"><a className="button button--dark" href={phone}>Bel ons <Phone size={17} aria-hidden="true" /></a><a className="text-link" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={17} aria-hidden="true" /></a></div></div>
        </div>
      </section>
    </>
  );
}

function Visit() {
  return (
    <>
      <PageHero
        eyebrow="Zoetermeer · Dorpsstraat"
        title="Tot zo"
        accent="aan de bar."
        image="mojito.jpg"
      >
        Bij Melanie aan de bar ben je welkom voor cocktails, lokaal bier en
        borrelbites.
      </PageHero>
      <section className="shell visit-page">
        <div>
          <p className="eyebrow">Wanneer zien we je?</p>
          <h2>
            Open voor <em>goede tijden.</em>
          </h2>
          <dl className="hours">
            <div>
              <dt>Maandag en dinsdag</dt>
              <dd>Gesloten</dd>
            </div>
            <div>
              <dt>Woensdag</dt>
              <dd>13:00–18:00</dd>
            </div>
            <div>
              <dt>Donderdag t/m zondag</dt>
              <dd>13:00–22:00</dd>
            </div>
          </dl>
          <ArrowLink to="/reserveer">Vraag een tafel aan</ArrowLink>
        </div>
        <div className="visit-card">
          <MapPin size={35} aria-hidden="true" />
          <p className="eyebrow">Hier vind je ons</p>
          <h3>
            Dorpsstraat 110H
            <br />
            2712 AM Zoetermeer
          </h3>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Dorpsstraat+110H%2C+Zoetermeer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open de route <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a href={phone}>079 711 35 35</a>
          <a href="mailto:info@thirtyfive.nl">Mail ons</a>
        </div>
      </section>
      <section className="shell about">
        <div>
          <p className="eyebrow">Over Mellie’s</p>
          <h2>
            Gerund door <em>Melanie.</em>
          </h2>
          <p>
            Melanie houdt van genieten en samenkomen. Bij Mellie’s kun je de
            hele dag borrelen met een plank om te delen. Later op de dag schuif
            je aan voor een cocktail of iets alcoholvrijs.
          </p>
          <p>
            Kom binnen voor een spontane borrel, of vraag vooraf een tafel aan.
            Je aanvraag is pas definitief zodra Melanie die heeft bevestigd.
          </p>
        </div>
        <img
          src={A + "aperol.jpg"}
          loading="lazy"
          alt="Cocktail bij Mellie’s"
        />
      </section>
      <div className="map">
        <iframe
          title="Mellie’s aan de Dorpsstraat 110H in Zoetermeer"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=Dorpsstraat%20110H%2C%202712%20AM%20Zoetermeer&output=embed"
        />
      </div>
    </>
  );
}

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Jouw gegevens" title="Privacy." accent="">
        Zo gaan we om met gegevens die je bij een reserveringsaanvraag invult.
      </PageHero>
      <section className="shell legal">
        <h2>Reserveringen</h2>
        <p>
          Voor een aanvraag vragen we je naam, e-mailadres, telefoonnummer,
          gewenste datum en tijd, aantal gasten en eventuele opmerking. We
          gebruiken deze gegevens om je aanvraag te beoordelen, contact met je
          op te nemen en je over de beslissing te informeren. Een aanvraag is
          pas een reservering na bevestiging.
        </p>
        <h2>Opslag en toegang</h2>
        <p>
          De gegevens staan in de database bij onze hostingprovider Hostinger.
          Alleen de beheerder van Mellie’s kan de aanvragen via het afgeschermde
          beheerscherm bekijken en behandelen. Voor meldingen en bevestigingen
          gebruiken we e-mail. We bewaren gegevens niet langer dan nodig voor de
          behandeling en administratie van de reservering.
        </p>
        <h2>Jouw verzoek</h2>
        <p>
          Wil je je gegevens inzien, laten corrigeren of verwijderen? Neem
          contact op via <a href="mailto:info@thirtyfive.nl">e-mail</a> of bel{" "}
          <a href={phone}>079 711 35 35</a>. Dit is tijdens de naamsverandering
          nog het bestaande contactadres.
        </p>
        <p>
          Dit is de privacyinformatie voor de conceptsite. Controleer de
          definitieve tekst en bewaartermijn voor de publieke lancering.
        </p>
      </section>
    </>
  );
}

async function api(path, options) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.error || "Er ging iets mis. Probeer het opnieuw.");
  return body;
}

function Booking() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState("");
  const weekday = date ? new Date(date + "T12:00:00Z").getUTCDay() : null;
  const slots = weekday === 3 ? 10 : [0, 4, 5, 6].includes(weekday) ? 18 : 0;
  useEffect(() => {
    api("/api/session")
      .then(setSession)
      .catch(() =>
        setError(
          "Het formulier is tijdelijk niet beschikbaar. Bel ons gerust.",
        ),
      );
  }, []);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/api/reservations", {
        method: "POST",
        body: JSON.stringify({ ...data, csrf: session.csrf }),
      });
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHero
        eyebrow="Reserveren"
        title="Jouw tafel"
        accent="wacht op je."
        image="aperol.jpg"
      >
        Kies een moment en vertel met hoeveel mensen je komt. Melanie beoordeelt
        je aanvraag. Je reservering is pas definitief na haar bevestiging.
      </PageHero>
      <section className="shell booking-layout">
        <div>
          <p className="eyebrow">Je aanvraag</p>
          <h2>
            Schuif je <em>aan?</em>
          </h2>
          {sent ? (
            <div className="feedback success" role="status">
              <h3>Aanvraag ontvangen.</h3>
              <p>
                Melanie bekijkt je verzoek. Je hebt nog geen bevestigde
                reservering; neem bij spoed telefonisch contact op.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p className="feedback" role="alert">
                  {error}
                </p>
              )}
              {session ? (
                <form onSubmit={submit} className="booking-form">
                  <div className="trap" aria-hidden="true">
                    <label>
                      Website{" "}
                      <input name="website" tabIndex="-1" autoComplete="off" />
                    </label>
                  </div>
                  <label>
                    Naam{" "}
                    <input
                      name="name"
                      autoComplete="name"
                      maxLength="100"
                      required
                    />
                  </label>
                  <div className="form-cols">
                    <label>
                      E-mailadres{" "}
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        maxLength="254"
                        required
                      />
                    </label>
                    <label>
                      Telefoonnummer{" "}
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        maxLength="30"
                        required
                      />
                    </label>
                  </div>
                  <div className="form-cols">
                    <label>
                      Datum{" "}
                      <input
                        type="date"
                        name="date"
                        min={session.minDate}
                        max={session.maxDate}
                        onChange={(event) => setDate(event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Tijd{" "}
                      <select
                        key={date}
                        name="time"
                        defaultValue=""
                        required
                        disabled={!slots}
                      >
                        <option value="" disabled>
                          Kies een tijd
                        </option>
                        {Array.from({ length: slots }, (_, i) => {
                          const h = 13 + Math.floor(i / 2);
                          const m = i % 2 ? "30" : "00";
                          const time = `${String(h).padStart(2, "0")}:${m}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </div>
                  {date && !slots && (
                    <p className="form-hint">
                      Op maandag en dinsdag zijn we gesloten. Kies een andere
                      dag.
                    </p>
                  )}
                  <label>
                    Aantal gasten{" "}
                    <input
                      type="number"
                      name="guests"
                      min="1"
                      max="20"
                      required
                    />
                  </label>
                  <label>
                    Opmerking (optioneel){" "}
                    <textarea name="note" rows="4" maxLength="1000" />
                  </label>
                  <p className="form-hint">
                    Woensdag 13:00–18:00 · donderdag t/m zondag 13:00–22:00. We
                    gebruiken je gegevens alleen om je aanvraag te behandelen.
                  </p>
                  <button type="submit" className="button" disabled={busy}>
                    {busy ? "Versturen…" : "Verstuur aanvraag"}{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </button>
                </form>
              ) : (
                !error && <p role="status">Formulier laden…</p>
              )}
            </>
          )}
        </div>
        <aside className="booking-aside">
          <span className="squiggle" aria-hidden="true">
            ✳
          </span>
          <p className="eyebrow">Vragen?</p>
          <h3>Neem contact op.</h3>
          <p>
            Een aanvraag is nog geen reservering. Bel ons als je snel
            duidelijkheid nodig hebt.
          </p>
          <a href={phone} className="button button--dark">
            Bel 079 711 35 35 <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </aside>
      </section>
    </>
  );
}

function readCover(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ mime: file.type, data: String(reader.result).split(",")[1] });
    reader.onerror = () => reject(new Error("De foto kon niet worden gelezen."));
    reader.readAsDataURL(file);
  });
}

function EventEditor({ event, onSave, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function submit(action) {
    action.preventDefault();
    setError("");
    const form = action.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    delete data.cover;
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      setError("Gebruik een JPG-, PNG- of WebP-foto van maximaal 2 MB.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...data, cover: file ? await readCover(file) : null, removeImage }, event?.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  const currentImage = event?.hasImage && !removeImage && !file && `/api/events/${event.id}/image?v=${encodeURIComponent(event.updatedAt)}`;
  return (
    <section className="event-editor" aria-label={event ? "Event bewerken" : "Nieuw event"}>
      <div className="event-editor__heading">
        <div><p className="eyebrow">Agenda beheren</p><h2>{event ? "Event bewerken" : "Nieuw event"}</h2></div>
        <button type="button" className="text-link" onClick={onCancel}>Sluiten <X size={17} aria-hidden="true" /></button>
      </div>
      {error && <p className="feedback" role="alert">{error}</p>}
      <form className="booking-form event-editor__form" onSubmit={submit}>
        <label>Titel <input name="title" defaultValue={event?.title || ""} maxLength="140" placeholder="Bijvoorbeeld: Cocktail Night" required /></label>
        <div className="form-cols">
          <label>Datum <input name="date" type="date" defaultValue={event?.date || ""} required /></label>
          <label>Starttijd <input name="startTime" type="time" defaultValue={event?.startTime || ""} required /></label>
        </div>
        <div className="form-cols">
          <label>Eindtijd (optioneel) <input name="endTime" type="time" defaultValue={event?.endTime || ""} /></label>
          <label>Zichtbaarheid
            <select name="status" defaultValue={event?.status || "draft"}>
              <option value="draft">Concept · alleen in beheer</option>
              <option value="published">Gepubliceerd · op de website</option>
            </select>
          </label>
        </div>
        <label>Omschrijving <textarea name="description" defaultValue={event?.description || ""} rows="6" maxLength="3000" placeholder="Vertel wat er te doen is en voor wie de avond is." required /></label>
        <label>Link voor meer info of aanmelden (optioneel) <input name="linkUrl" type="url" defaultValue={event?.linkUrl || ""} maxLength="1000" placeholder="https://..." /></label>
        <p className="form-hint">Zonder aanmeldlink verwijst de eventpagina naar het reserveringsformulier.</p>
        <label>Poster of foto (optioneel) <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setFile(e.target.files?.[0] || null); setRemoveImage(false); }} /></label>
        <p className="form-hint">JPG, PNG of WebP, maximaal 2 MB. Een staande poster komt mooi uit in de agenda.</p>
        {(preview || currentImage) && <div className="event-editor__preview"><img src={preview || currentImage} alt="Voorvertoning van de eventfoto" /><span><ImagePlus size={17} aria-hidden="true" /> {preview ? "Nieuwe foto geselecteerd" : "Huidige foto"}</span></div>}
        {event?.hasImage && !file && (
          <label className="event-editor__checkbox"><input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Bestaande foto verwijderen</label>
        )}
        <div className="actions"><button className="button" type="submit" disabled={saving}>{saving ? "Opslaan…" : event ? "Wijzigingen opslaan" : "Event opslaan"} <ArrowUpRight size={17} aria-hidden="true" /></button><button type="button" className="text-link" onClick={onCancel}>Annuleren</button></div>
      </form>
    </section>
  );
}

function Admin() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("reservations");
  const [editor, setEditor] = useState(undefined);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/api/session")
      .then(setSession)
      .catch(() => setError("Beheer is tijdelijk niet beschikbaar."));
  }, []);
  useEffect(() => {
    if (session?.admin)
      api("/api/admin/reservations")
        .then((data) => setRows(data.reservations))
        .catch((e) => setError(e.message));
  }, [session]);
  useEffect(() => {
    if (session?.admin && tab === "events")
      api("/api/admin/events")
        .then((data) => setEvents(data.events))
        .catch((e) => setError(e.message));
  }, [session?.admin, tab]);
  async function login(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          csrf: session.csrf,
          password: new FormData(event.currentTarget).get("password"),
        }),
      });
      setSession({ ...session, ...data, admin: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("/api/admin/logout", {
        method: "POST",
        body: JSON.stringify({ csrf: session.csrf }),
      });
      setSession(null);
      setRows([]);
      setEvents([]);
      setEditor(undefined);
      setTab("reservations");
      setMessage("");
      setSession(await api("/api/session"));
    } catch (e) {
      setError(e.message);
    }
  }
  async function decide(id, decision) {
    if (
      !window.confirm(
        `Aanvraag #${id} ${decision === "approved" ? "bevestigen" : "afwijzen"}?`,
      )
    )
      return;
    setError("");
    setBusy(true);
    try {
      const data = await api(`/api/admin/reservations/${id}/decision`, {
        method: "POST",
        body: JSON.stringify({ csrf: session.csrf, decision }),
      });
      setMessage(data.message);
      setRows((await api("/api/admin/reservations")).reservations);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveEvent(data, id) {
    await api(id ? `/api/admin/events/${id}` : "/api/admin/events", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({ ...data, csrf: session.csrf }),
    });
    setEditor(undefined);
    setError("");
    setMessage(id ? "Event bijgewerkt." : "Event opgeslagen.");
    try {
      setEvents((await api("/api/admin/events")).events);
    } catch {
      setError("Event opgeslagen, maar de lijst kon niet worden ververst. Herlaad de pagina.");
    }
  }
  async function deleteEvent(event) {
    if (!window.confirm(`"${event.title}" definitief verwijderen? Dit verwijdert ook de foto.`)) return;
    setError("");
    try {
      await api(`/api/admin/events/${event.id}`, {
        method: "DELETE", body: JSON.stringify({ csrf: session.csrf }),
      });
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setMessage("Event verwijderd.");
      if (editor?.id === event.id) setEditor(undefined);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="shell admin">
      <p className="eyebrow">Mellie’s · beheer</p>
      <h1>Beheer.</h1>
      {error && (
        <p className="feedback" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="feedback success" role="status">
          {message}
        </p>
      )}
      {session && !session.admin && (
        <form onSubmit={login} className="booking-form admin-login">
          <label>
            Beheerwachtwoord{" "}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="button" disabled={busy}>
            Inloggen <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      )}
      {session?.admin && (
        <>
          <div className="admin__tools">
            <p>Beheer hier reserveringsaanvragen en de agenda van Mellie’s.</p>
            <button className="text-link" type="button" onClick={logout}>
              Uitloggen <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="admin-tabs" role="tablist" aria-label="Beheeronderdelen">
            <button type="button" role="tab" aria-selected={tab === "reservations"} onClick={() => { setTab("reservations"); setEditor(undefined); setMessage(""); }}>Reserveringen</button>
            <button type="button" role="tab" aria-selected={tab === "events"} onClick={() => { setTab("events"); setMessage(""); }}>Events</button>
          </div>
          {tab === "reservations" ? <div role="tabpanel" className="admin-list">
            <p className="admin-list__intro">Bevestig alleen als er plaats is. Neem zelf contact op als een e-mail niet is verzonden.</p>
            {rows.map((row) => (
              <article className="admin-card" key={row.id}>
                <p className="eyebrow">
                  {row.status} · #{row.id}
                </p>
                <h2>
                  {String(row.reservation_date)
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("-")}{" "}
                  om {row.reservation_time.slice(0, 5)}
                </h2>
                <p>
                  <strong>{row.name}</strong> · {row.guests} gasten
                  <br />
                  <a href={`mailto:${row.email}`}>{row.email}</a> ·{" "}
                  <a href={`tel:${row.phone}`}>{row.phone}</a>
                </p>
                {row.note && <p className="admin-card__note">{row.note}</p>}
                <small>
                  Aangevraagd: {row.created_at} · Bericht:{" "}
                  {row.notified_at
                    ? "aangeboden aan mailserver"
                    : "niet verzonden"}
                </small>
                {row.status === "pending" && (
                  <div className="actions">
                    <button
                      disabled={busy}
                      className="button"
                      onClick={() => decide(row.id, "approved")}
                    >
                      Bevestigen
                    </button>
                    <button
                      disabled={busy}
                      className="button button--line"
                      onClick={() => decide(row.id, "declined")}
                    >
                      Afwijzen
                    </button>
                  </div>
                )}
              </article>
            ))}
            {rows.length === 0 && <p>Er zijn nog geen aanvragen.</p>}
          </div> : <div role="tabpanel" className="admin-events">
            <div className="admin-events__top"><div><p className="eyebrow">Agenda van Mellie’s</p><h2>Jouw events.</h2><p>Een gepubliceerd event verschijnt meteen op de eventpagina, op volgorde van datum. Concepten zijn alleen hier zichtbaar.</p></div><button type="button" className="button" onClick={() => { setEditor(null); setMessage(""); }}>Nieuw event <ArrowUpRight size={18} aria-hidden="true" /></button></div>
            {editor !== undefined && <EventEditor key={editor?.id || "new"} event={editor} onSave={saveEvent} onCancel={() => setEditor(undefined)} />}
            <div className="admin-event-list">
              {events.map((event) => (
                <article className="admin-event" key={event.id}>
                  <div className="admin-event__date"><strong>{eventDate(event.date, { day: "2-digit" })}</strong><span>{eventDate(event.date, { month: "short", year: "numeric" })}</span></div>
                  <div><p className="eyebrow">{event.status === "published" ? "Gepubliceerd" : "Concept"} · {event.startTime} uur</p><h3>{event.title}</h3><p>{event.description}</p></div>
                  <div className="admin-event__actions"><button type="button" className="text-link" onClick={() => { setEditor(event); setMessage(""); window.scrollTo({ top: 300, behavior: "smooth" }); }}>Bewerken <Pencil size={16} aria-hidden="true" /></button><button type="button" className="text-link" onClick={() => deleteEvent(event)}>Verwijderen <Trash2 size={16} aria-hidden="true" /></button></div>
                </article>
              ))}
              {events.length === 0 && <p>Er zijn nog geen events. Voeg de eerste avond toe met de knop hierboven.</p>}
            </div>
          </div>}
        </>
      )}
    </section>
  );
}

function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      "/": "Cocktails & borrelbites in Zoetermeer",
      "/kaart": "De kaart",
      "/events": "Events",
      "/bezoek": "Bezoek & contact",
      "/reserveer": "Reserveren",
      "/privacy": "Privacy",
      "/admin": "Reserveringen beheren",
    };
    document.title = `${titles[location.pathname] || "Mellie’s"} | Mellie’s Drinks & Bites`;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

function App() {
  const location = useLocation();
  return (
    <>
      <PageTitle />
      <a className="skip" href="#inhoud">
        Direct naar inhoud
      </a>
      <Header />
      <main id="inhoud">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/kaart" element={<CardMenu />} />
              <Route path="/events" element={<Events />} />
              <Route path="/bezoek" element={<Visit />} />
              <Route path="/reserveer" element={<Booking />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<Admin />} />
              <Route
                path="*"
                element={
                  <section className="shell not-found">
                    <h1>Pagina niet gevonden.</h1>
                    <ArrowLink to="/">Terug naar home</ArrowLink>
                  </section>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
