export function AboutSection() {
  const usps = [
    {
      number: "100%",
      label: "Op maat gemaakt",
      description: "Geen standaardmaten, altijd maatwerk",
    },
    {
      number: "A+",
      label: "Kwaliteitsstoffen",
      description: "Geselecteerd op duurzaamheid en kleurechtheid",
    },
    {
      number: "Premium",
      label: "Materialen",
      description: "Uitsluitend hoogwaardige Europese stoffen",
    },
    {
      number: "Thuis",
      label: "Kleuren vergelijken",
      description: "Bestel stalen om op uw gemak te kiezen",
    },
  ];

  return (
    <section id="about" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Over ons
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Raamdecoratie waar vakmanschap en stijl samenkomen
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Pure Blinds is gespecialiseerd in raamdecoratie op maat voor woningen,
          bedrijfspanden en kantoren. Elk product wordt met oog voor detail
          vervaardigd uit premium materialen, zodat het naadloos aansluit bij uw
          interieur en precies doet wat u ervan verwacht.
        </p>

        {/* USP Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((usp) => (
            <div key={usp.label} className="rounded-2xl bg-white p-6 shadow-lifted">
              <div className="text-3xl font-semibold text-foreground sm:text-4xl">
                {usp.number}
              </div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                {usp.label}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {usp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
