export function AboutSection() {
  const stats = [
    {
      number: "15+",
      label: "Jaar ervaring",
      description: "Sinds 2009 actief",
    },
    {
      number: "10K+",
      label: "Tevreden klanten",
      description: "Door heel Nederland",
    },
    {
      number: "50+",
      label: "Stofopties",
      description: "Premium materialen naar keuze",
    },
    {
      number: "24u",
      label: "Doorlooptijd",
      description: "Snelle productie bij de meeste bestellingen",
    },
  ];

  return (
    <section id="about" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Over ons
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Rolgordijnen op maat met precisie en zorg
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Wij zijn gespecialiseerd in rolgordijnen op maat voor woningen, bedrijven
          en kantoren. Elk stuk wordt met aandacht voor detail vervaardigd, met
          premium materialen en precieze afmetingen om precies te leveren wat u nodig heeft.
        </p>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-lifted">
              <div className="text-3xl font-semibold text-foreground sm:text-4xl">
                {stat.number}
              </div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                {stat.label}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
