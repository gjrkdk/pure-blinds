import Link from "next/link";

export function HowItWorksSection() {
  const steps: Array<{
    label: string;
    title: string;
    description: React.ReactNode;
    tagline: string;
  }> = [
    {
      label: "Stap Een",
      title: "Meet uw raam op",
      description: (
        <>
          Meet de breedte en hoogte van uw raam in millimeters. Bekijk onze{" "}
          <Link
            href="/inmeetinstructies"
            className="underline underline-offset-4 hover:text-accent-foreground transition-colors"
          >
            inmeetinstructies
          </Link>{" "}
          om u te helpen het goed te doen.
        </>
      ),
      tagline: "Eenvoudig en precies!",
    },
    {
      label: "Stap Twee",
      title: "Kies uw raamdecoratie",
      description:
        "Selecteer het type raamdecoratie, de stof en kleur die bij uw interieur passen. Voer uw afmetingen in en zie direct de prijs — geen wachten op offertes.",
      tagline: "Direct uw prijs!",
    },
    {
      label: "Stap Drie",
      title: "Bestel en ontvang",
      description:
        "Plaats uw bestelling en wij gaan voor u aan de slag. Uw raamdecoratie wordt op maat gemaakt volgens uw specificaties en met zorg aan huis geleverd.",
      tagline: "Snel bezorgd!",
    },
  ];

  return (
    <section id="how-it-works" className="bg-foreground px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-700/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-neutral-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
            </svg>
            Hoe het werkt
          </span>
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-center text-3xl font-medium tracking-tight text-accent-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          Uw raamdecoratie op maat
          <br className="hidden sm:block" />
          {" "}in drie stappen.
        </h2>

        {/* Cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className="relative flex flex-col rounded-2xl border border-neutral-700/50 bg-neutral-900/40 p-6"
            >
              {/* Label + Title */}
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {step.label}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-accent-foreground">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-300">
                {step.description}
              </p>

              {/* Arrow + Tagline row */}
              <div className="mt-6 flex items-center justify-between">
                {index < steps.length - 1 ? (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-foreground text-foreground">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-foreground text-foreground">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <span className="rounded-full border border-neutral-700/50 bg-neutral-800/60 px-3 py-1 text-xs font-medium text-accent-foreground">
                  {step.tagline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
