export function WorkSection() {
  const projects = [
    {
      title: "Modern Living Room Curtains",
      category: "Residential",
      duration: "2 weeks",
      description:
        "Custom blackout curtains for a contemporary family home, designed to control natural light while complementing the minimalist interior design.",
      testimonial:
        "The curtains transformed our living space. Perfect fit and beautiful quality.",
      author: "Emma Thompson",
      authorRole: "Homeowner",
    },
    {
      title: "Restaurant Privacy Screens",
      category: "Commercial",
      duration: "3 weeks",
      description:
        "Elegant floor-to-ceiling room dividers for an upscale restaurant, providing intimate dining spaces while maintaining visual flow throughout the venue.",
      testimonial:
        "These dividers elevated our dining experience. Guests love the added privacy.",
      author: "Marco Rossi",
      authorRole: "Restaurant Owner",
    },
    {
      title: "Corporate Exhibition Backdrop",
      category: "Events",
      duration: "1 week",
      description:
        "Branded fabric backdrop panels for a technology company's trade show booth, delivering professional presentation with quick turnaround time.",
      testimonial:
        "Delivered on time, looked stunning, and made our booth stand out.",
      author: "Jennifer Chen",
      authorRole: "Marketing Director",
    },
  ];

  return (
    <section id="our-work" className="border-t border-border px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Our Work
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Projects we&rsquo;re proud of
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          From residential curtains to commercial installations, see how we bring
          custom textile solutions to life for diverse clients.
        </p>

        <div className="mt-14 space-y-16 sm:space-y-20">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Image placeholder */}
              <div
                className={index % 2 === 1 ? "md:order-2" : ""}
              >
                <div className="aspect-[4/3] w-full bg-white rounded-2xl shadow-lifted flex items-center justify-center">
                  <span className="text-sm text-muted">Project Image</span>
                </div>
              </div>

              {/* Content */}
              <div
                className={index % 2 === 1 ? "md:order-1" : ""}
              >
                {/* Tags */}
                <div className="flex gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 border border-border text-muted">
                    {project.category}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 border border-border text-muted">
                    {project.duration}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-medium text-foreground sm:text-2xl mt-4">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted mt-3">
                  {project.description}
                </p>

                {/* Inline testimonial */}
                <blockquote className="mt-6 border-l-2 border-border pl-4">
                  <p className="text-sm italic text-muted">
                    &ldquo;{project.testimonial}&rdquo;
                  </p>
                  <footer className="text-xs text-muted mt-2">
                    &mdash; {project.author}, {project.authorRole}
                  </footer>
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
