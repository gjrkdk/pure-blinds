import Breadcrumbs from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inmeetinstructies | Pure Blinds",
  description:
    "Leer hoe u uw raam correct opmeet voor raamdecoratie op maat. Stapsgewijze meetinstructies voor montage in de dag en op de dag.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Inmeetinstructies | Pure Blinds",
    description:
      "Leer hoe u uw raam correct opmeet voor raamdecoratie op maat.",
    siteName: "Pure Blinds",
  },
};

const inDeDagSteps = [
  {
    title: "Meet de breedte",
    description:
      "Meet de binnenbreedte van het kozijn op drie punten: boven, midden en onder. Noteer de kleinste maat in millimeters. Dit is uw bestelbreedte.",
  },
  {
    title: "Meet de hoogte",
    description:
      "Meet de binnenhoogte van het kozijn op drie punten: links, midden en rechts. Noteer de kleinste maat in millimeters. Dit is uw bestelhoogte.",
  },
  {
    title: "Controleer de diepte",
    description:
      "Controleer of er voldoende montageruimte is in het kozijn. U heeft minimaal 6 cm diepte nodig voor een standaard rolgordijn. Houd ook rekening met handels of uitstekende delen.",
  },
];

const opDeDagSteps = [
  {
    title: "Meet de breedte",
    description:
      "Meet de buitenbreedte die u wilt bedekken. Tel aan elke zijde minimaal 5 cm op bij de breedte van het glasoppervlak, zodat er geen lichtspleten ontstaan. Noteer de totale maat in millimeters.",
  },
  {
    title: "Meet de hoogte",
    description:
      "Meet de gewenste hoogte vanaf het montagepunt tot waar het gordijn moet eindigen. Tel boven het kozijn minimaal 5 cm op voor de bevestiging. Noteer de maat in millimeters.",
  },
  {
    title: "Controleer de montageruimte",
    description:
      "Controleer of de wand of het plafond boven het kozijn geschikt is voor bevestiging. Zorg dat er geen obstakels zijn zoals leidingen, ventilatieroosters of een ander kozijn dat in de weg zit.",
  },
];

export default function InmeetinstructiesPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Inmeetinstructies", current: true },
          ]}
        />

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Meetgids
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            Inmeetinstructies
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Het correct opmeten van uw raam is essentieel voor een perfect
            passend resultaat. Hieronder vindt u stapsgewijze instructies voor
            beide montagetypes.
          </p>
        </div>

        {/* In de dag */}
        <div className="mt-16">
          <h2 className="text-2xl font-light tracking-tight text-foreground">
            Montage in de dag
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bij montage in de dag wordt de raamdecoratie binnen het kozijn
            bevestigd. Het gordijn valt daardoor precies in de raamopening.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {inDeDagSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-lifted"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Op de dag */}
        <div className="mt-16">
          <h2 className="text-2xl font-light tracking-tight text-foreground">
            Montage op de dag
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bij montage op de dag wordt de raamdecoratie op de muur of het
            plafond boven het kozijn bevestigd. Het gordijn valt hierdoor over
            het kozijn heen.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {opDeDagSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-lifted"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-16 rounded-lg border border-border p-8 sm:p-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Tips voor nauwkeurig meten
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              "Gebruik altijd een stalen rolmaat voor de meest nauwkeurige meting.",
              "Meet altijd in millimeters — niet in centimeters.",
              "Meet elk punt minimaal twee keer ter controle.",
              "Rond nooit af naar boven. Bij twijfel: neem de kleinste maat.",
              "Houd rekening met raamkrukken, ventilatieroosters en andere obstakels.",
            ].map((tip) => (
              <li key={tip} className="flex gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 flex-none text-accent"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-sm text-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
