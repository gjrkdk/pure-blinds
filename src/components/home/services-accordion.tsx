"use client";

import { useState } from "react";
import Image from "next/image";

const SERVICES = [
  {
    title: "Transparante Rolgordijnen",
    description:
      "Lichtdoorlatende rolgordijnen die privacy bieden terwijl ze natuurlijk licht doorlaten. Perfect voor woonkamers, kantoren en ruimtes waar u een balans wilt tussen privacy en daglicht.",
  },
  {
    title: "Verduisterende Rolgordijnen",
    description:
      "Blackout rolgordijnen die 100% licht tegenhouden voor volledige duisternis. Ideaal voor slaapkamers, thuisbioscopen en ruimtes waar complete lichtcontrole essentieel is.",
  },
  {
    title: "Rolgordijnen voor Kantoor",
    description:
      "Professionele rolgordijnen op maat voor zakelijke omgevingen. Brandvertragend materiaal verkrijgbaar, met opties voor geluidsdemping en optimale lichtregulatie voor werkplekken.",
  },
  {
    title: "Advies op Maat",
    description:
      "Persoonlijk advies over het opmeten van uw ramen, keuze van materialen en kleuren. Wij helpen u bij het selecteren van het perfecte rolgordijn dat past bij uw interieur en functionele wensen.",
  },
  {
    title: "Montageservice",
    description:
      "Professionele montage van uw rolgordijnen door ervaren monteurs. Wij zorgen voor een perfecte afwerking en uitleg over het gebruik en onderhoud van uw nieuwe rolgordijnen.",
  },
];

export function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="services" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Wat wij doen
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Diensten afgestemd op uw wensen
        </h2>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Left column: Accordion */}
          <div>
            {SERVICES.map((service, index) => (
              <div key={service.title}>
                <button
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between border-b border-border py-5 text-left"
                >
                  <span className="text-base font-medium text-foreground sm:text-lg">
                    {service.title}
                  </span>
                  <svg
                    className="h-5 w-5 shrink-0 text-foreground transition-transform duration-300"
                    style={{
                      transform:
                        openIndex === index ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openIndex === index ? "10rem" : "0",
                  }}
                >
                  <p className="py-4 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right column: Sticky Image */}
          <div className="mt-12 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lifted">
              <Image
                src="/png/rolgordijn-in-woonkamer-situatie.png"
                alt="Onze diensten"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
