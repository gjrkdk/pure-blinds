export function AboutSection() {
  const stats = [
    {
      number: "15+",
      label: "Years Experience",
      description: "Serving customers since 2009",
    },
    {
      number: "10K+",
      label: "Happy Customers",
      description: "Across Europe and beyond",
    },
    {
      number: "50+",
      label: "Fabric Options",
      description: "Premium materials to choose from",
    },
    {
      number: "24h",
      label: "Turnaround",
      description: "Quick production on most orders",
    },
  ];

  return (
    <section id="about" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          About Us
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Crafting custom textiles with precision and care
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          We specialize in made-to-measure textiles for homes, businesses, and
          events. Every piece is crafted with attention to detail, using premium
          materials and precise measurements to deliver exactly what you need.
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
