import Link from "next/link";
import Image from "next/image";
import { AboutSection } from "@/components/home/about-section";
import { ServicesAccordion } from "@/components/home/services-accordion";

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
      <section className="relative min-h-screen">
        {/* Mobile: background image with overlay */}
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/hero-placeholder.svg"
            alt="Custom textile showcase"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>

        {/* Desktop layout */}
        <div className="relative flex flex-col justify-center min-h-screen md:flex-row md:items-center md:gap-12 lg:gap-16 px-6 md:px-12 lg:px-20 mx-auto max-w-7xl">
          {/* Text content — left ~60% */}
          <div className="flex flex-col justify-center py-32 md:py-0 md:w-[58%] md:shrink-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Premium Custom Textiles
            </p>
            <h1 className="mt-4 text-4xl font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Textiles, crafted to your exact dimensions
            </h1>
            <p className="mt-6 max-w-md text-base text-muted sm:text-lg">
              Premium custom-sized fabrics — priced instantly, produced with care,
              and delivered to your door.
            </p>
            <div className="mt-10">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 rounded-full bg-accent pl-7 pr-2 py-2 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
              >
                Get in Touch
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-foreground/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Image — hidden on mobile (used as bg), right ~42% on desktop with rounded corners */}
          <div className="hidden md:block relative md:w-[42%] md:shrink-0 self-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
              <Image
                src="/hero-placeholder.svg"
                alt="Custom textile showcase"
                fill
                className="object-cover"
                priority
              />

              {/* Testimonial card overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-lg">
                <div className="flex gap-0.5 text-foreground mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground mb-2">
                  &ldquo;Absolutely perfect curtains, exactly the dimensions we needed.&rdquo;
                </p>
                <div className="text-xs text-muted">
                  <span className="font-medium">Sarah M.</span>
                  <span className="mx-1.5">&middot;</span>
                  <span>Interior Designer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <AboutSection />

      {/* Services */}
      <ServicesAccordion />

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
