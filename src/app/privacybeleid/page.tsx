import Breadcrumbs from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid | Pure Blinds",
  description:
    "Lees hoe Pure Blinds omgaat met jouw persoonsgegevens en cookies. We zijn transparant over het gebruik van Google Analytics en jouw keuzemogelijkheden.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Privacybeleid | Pure Blinds",
    description:
      "Lees hoe Pure Blinds omgaat met jouw persoonsgegevens en cookies.",
    siteName: "Pure Blinds",
  },
};

export default function PrivacybeleidPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacybeleid", current: true },
          ]}
        />

        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Privacy & Cookies
            </p>
            <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
              Privacybeleid
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We zijn eerlijk over hoe we omgaan met jouw gegevens en welke
              cookies we gebruiken.
            </p>
          </div>

          <div className="prose prose-sm mt-12 max-w-none">
            <section>
              <h2>Wie zijn wij</h2>
              <p>
                Pure Blinds (pure-blinds.nl) is een online winkel waar je
                rolgordijnen op maat kunt bestellen. We zijn gevestigd in
                Nederland en verkopen rechtstreeks aan consumenten.
              </p>
            </section>

            <section>
              <h2>Welke gegevens verzamelen we</h2>
              <p>
                We gebruiken Google Analytics 4 (GA4) om te begrijpen hoe
                bezoekers onze website gebruiken. Denk aan welke pagina&apos;s
                worden bezocht, hoe lang iemand op een pagina blijft en via
                welk kanaal iemand op de site terechtkomt. We kunnen dit alleen
                doen als jij daar toestemming voor geeft via ons cookiebanner.
              </p>
              <p>
                De gegevens die GA4 verzamelt zijn geanonimiseerd en worden niet
                gekoppeld aan jouw naam of andere identificerende informatie.
              </p>
            </section>

            <section>
              <h2>Cookies</h2>
              <p>We gebruiken twee soorten cookies:</p>
              <ul>
                <li>
                  <strong>Noodzakelijke cookies</strong> — Deze cookies zijn
                  nodig voor het functioneren van de website, zoals het bijhouden
                  van jouw winkelwagen. Hiervoor is geen toestemming nodig.
                </li>
                <li>
                  <strong>Analytische cookies (Google Analytics 4)</strong> —
                  Deze cookies plaatsen we alleen als jij daarvoor toestemming
                  geeft via het cookiebanner. Het gaat om de cookies{" "}
                  <code>_ga</code> en <code>_gid</code>, die Google gebruikt om
                  websitebezoek te meten. We gebruiken geen marketing- of
                  advertentiecookies.
                </li>
              </ul>
            </section>

            <section>
              <h2>Toestemming</h2>
              <p>
                Bij je eerste bezoek aan onze website verschijnt er een banner
                onderaan de pagina. Daarin kun je kiezen of je analytische cookies
                toestaat of weigert. Je keuze heeft geen invloed op de
                werking van de website — je kunt altijd gewoon rolgordijnen
                bekijken en bestellen.
              </p>
              <p>
                Je toestemming (of weigering) bewaren we 12 maanden in je
                browser. Na die periode vragen we opnieuw om toestemming. Je
                kunt je keuze ook eerder terugdraaien door de browserdata of
                local storage te wissen.
              </p>
            </section>

            <section>
              <h2>Hoe lang bewaren we gegevens</h2>
              <p>
                Google Analytics bewaart de verzamelde websitedata standaard 14
                maanden. Je toestemmingskeuze wordt 12 maanden opgeslagen in
                jouw browser.
              </p>
            </section>

            <section>
              <h2>Jouw rechten</h2>
              <p>
                Op grond van de AVG (Algemene Verordening Gegevensbescherming)
                heb je de volgende rechten:
              </p>
              <ul>
                <li>
                  <strong>Inzage</strong> — Je kunt opvragen welke gegevens we
                  van jou hebben.
                </li>
                <li>
                  <strong>Correctie</strong> — Je kunt onjuiste gegevens laten
                  aanpassen.
                </li>
                <li>
                  <strong>Verwijdering</strong> — Je kunt verzoeken om
                  verwijdering van jouw gegevens.
                </li>
                <li>
                  <strong>Bezwaar</strong> — Je kunt bezwaar maken tegen het
                  verwerken van jouw gegevens.
                </li>
              </ul>
              <p>
                Je kunt je toestemming voor analytische cookies op elk moment
                intrekken door de local storage van je browser te wissen via de
                browserinstellingen.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Heb je vragen over dit privacybeleid of over jouw gegevens? Neem
                dan contact op via{" "}
                <a href="mailto:info@pure-blinds.nl">info@pure-blinds.nl</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
