import Image from "next/image";
import Link from "next/link";
import { AboutSection } from "@/components/home/about-section";
import { ServicesAccordion } from "@/components/home/services-accordion";
import { HowItWorksSection } from "@/components/home/how-it-works-section";

import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import type { Metadata } from "next";
import { JsonLd } from "@/lib/schema/jsonld";
import { buildOrganizationSchema } from "@/lib/schema/organization";
import { buildFaqSchema } from "@/lib/schema/faq";
import { FAQ_ITEMS } from "@/data/faq-items";

export const metadata: Metadata = {
  title: "Raamdecoratie op Maat | Pure Blinds",
  description:
    "Hoogwaardige raamdecoratie, op maat gemaakt voor uw interieur. Configureer uw maten, zie direct de prijs en bestel eenvoudig online. Vakkundig vervaardigd, snel geleverd.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Raamdecoratie op Maat | Pure Blinds",
    description:
      "Hoogwaardige raamdecoratie, op maat gemaakt voor uw interieur. Configureer uw maten, zie direct de prijs en bestel eenvoudig online. Vakkundig vervaardigd, snel geleverd.",
    siteName: "Pure Blinds",
  },
};

export default function Home() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pure-blinds.nl';
  const orgSchema = buildOrganizationSchema(BASE_URL);
  const faqSchema = buildFaqSchema(FAQ_ITEMS);

  return (
    <>
      <JsonLd data={orgSchema} />
      <JsonLd data={faqSchema} />

      {/* Hero */}
      <section className="relative h-[calc(100dvh-5rem)]">
        {/* Mobile: background image with overlay */}
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/images/transparant-rolgordijn-woonkamer.webp"
            alt="Raamdecoratie op maat in woonkamer"
            fill
            sizes="100vw"
            className="object-cover object-[10%_center]"
            priority
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>

        {/* Desktop layout */}
        <div className="relative flex flex-col justify-center h-full md:flex-row md:items-center md:gap-12 lg:gap-16 px-6 md:px-12 lg:px-20 mx-auto max-w-7xl">
          {/* Text content */}
          <div className="flex flex-col justify-center py-32 md:py-0 md:w-[38%] md:shrink-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Raamdecoratie op maat
            </p>
            <h1 className="mt-4 text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Geef uw ramen de afwerking die ze verdienen
            </h1>
            <p className="mt-6 max-w-md text-base text-muted sm:text-lg">
              Hoogwaardige raamdecoratie, vakkundig vervaardigd op uw exacte
              maten. Configureer online, zie direct uw prijs en ontvang uw
              bestelling snel aan huis.
            </p>
            <div className="mt-10">
              <Link
                href="/producten"
                className="inline-flex items-center gap-3 rounded-full bg-accent pl-7 pr-2 py-2 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
              >
                Stel uw product samen
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-foreground/10">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Image — hidden on mobile (used as bg), right side on desktop */}
          <div className="hidden md:block relative md:flex-1 self-stretch py-8">
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lifted">
              <Image
                src="/images/transparant-rolgordijn-woonkamer.webp"
                alt="Raamdecoratie op maat in woonkamer"
                fill
                sizes="(max-width: 768px) 0vw, 60vw"
                className="object-cover object-[10%_center]"
                priority
              />

              {/* Testimonial card overlay */}
              {/* <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-lg">
                <div className="flex gap-0.5 text-foreground mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground mb-2">
                  &ldquo;Absolutely perfect curtains, exactly the dimensions we
                  needed.&rdquo;
                </p>
                <div className="text-xs text-muted">
                  <span className="font-medium">Sarah M.</span>
                  <span className="mx-1.5">&middot;</span>
                  <span>Interior Designer</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <AboutSection />

      {/* Services */}
      <ServicesAccordion />

      {/* How It Works */}
      <HowItWorksSection />

      {/* FAQ */}
      <FaqSection />

      {/* Contact */}
      <ContactSection />
    </>
  );
}
