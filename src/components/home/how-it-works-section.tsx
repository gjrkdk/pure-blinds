export function HowItWorksSection() {
  const steps = [
    {
      label: "Step One",
      title: "Measure Your Window",
      description:
        "Measure your window width and height in millimeters. Our product pages include measuring guides to help you get it right.",
      tagline: "Simple & Precise!",
    },
    {
      label: "Step Two",
      title: "Choose Your Blind",
      description:
        "Pick your blind type, fabric, and color. Enter your dimensions and see the price instantly — no waiting for quotes.",
      tagline: "Instant Pricing!",
    },
    {
      label: "Step Three",
      title: "Order & Receive",
      description:
        "Add to cart and checkout. Your blinds are custom-made to your exact specifications and shipped directly to your door.",
      tagline: "Fast Delivery!",
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
            How It Works
          </span>
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-center text-3xl font-medium tracking-tight text-accent-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          Custom Blinds In Three
          <br className="hidden sm:block" />
          {" "}Simple Steps.
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
