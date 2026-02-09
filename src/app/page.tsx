import Link from "next/link";

const USE_CASES = [
  {
    title: "Curtains",
    description:
      "Floor-to-ceiling or window-width — specify exact measurements for a perfect fit.",
    href: "/products/custom-textile",
  },
  {
    title: "Room Dividers",
    description:
      "Partition spaces with precision-cut fabric panels in any dimension you need.",
    href: "/products/custom-textile",
  },
  {
    title: "Banners",
    description:
      "Event displays, retail signage, or trade show backdrops — sized to your spec.",
    href: "/products/custom-textile",
  },
  {
    title: "Flags",
    description:
      "Custom flags for any occasion. From small desk flags to large outdoor displays.",
    href: "/products/custom-textile",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Choose your dimensions",
    description: "Enter the exact width and height you need, from 10 to 200 cm.",
  },
  {
    number: "02",
    title: "Get an instant price",
    description: "See your price update in real time as you adjust dimensions.",
  },
  {
    number: "03",
    title: "Place your order",
    description: "Add to cart and check out securely through our payment system.",
  },
  {
    number: "04",
    title: "Delivered to your door",
    description: "Your custom textile is produced and shipped directly to you.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <h1 className="max-w-3xl text-4xl font-light leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Textiles, made to your
            <br />
            <span className="font-normal italic">exact</span> dimensions
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
            Premium custom-sized fabrics — priced instantly, produced with care,
            and delivered to your door.
          </p>
          <Link
            href="/products/custom-textile"
            className="mt-10 inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
          >
            Start configuring
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section id="about" className="border-y border-border bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-3 sm:gap-8">
          {[
            {
              title: "Made to Measure",
              text: "Specify any dimension between 10 and 200 cm. Each piece is cut precisely to your requirements.",
            },
            {
              title: "Instant Pricing",
              text: "No waiting for quotes. Our live calculator shows your exact price as you enter dimensions.",
            },
            {
              title: "Quality Materials",
              text: "Durable, premium-grade fabrics suitable for interiors, displays, and everyday use.",
            },
          ].map((prop) => (
            <div key={prop.title}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                {prop.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {prop.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Showcase */}
      <section id="services" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Use cases
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            One configurator, endless possibilities
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col justify-between border border-border p-8 transition-colors hover:bg-surface sm:p-10"
              >
                <div>
                  <h3 className="text-xl font-normal text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
                <span className="mt-8 text-sm text-muted transition-colors group-hover:text-foreground">
                  Configure &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="work" className="border-y border-border bg-surface px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Process
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step) => (
              <div key={step.number}>
                <span className="font-mono text-xs text-muted">
                  {step.number}
                </span>
                <h3 className="mt-2 text-base font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="contact" className="bg-foreground px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-light tracking-tight text-accent-foreground sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-neutral-400">
            Enter your dimensions, see your price, and order — all in under a
            minute.
          </p>
          <Link
            href="/products/custom-textile"
            className="mt-8 inline-flex items-center gap-2 border border-neutral-600 px-8 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-colors hover:border-neutral-400 hover:text-white"
          >
            Start configuring
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}
