"use client";

import { useState } from "react";
import Image from "next/image";

const SERVICES = [
  {
    title: "Custom Curtains",
    description:
      "Made-to-measure curtains tailored to your exact window dimensions. Choose from our range of premium fabrics and finishes to create the perfect window treatment for your space.",
  },
  {
    title: "Room Dividers",
    description:
      "Flexible space partitioning solutions for homes and offices. Precision-cut fabric panels that create privacy and define areas while maintaining an elegant aesthetic.",
  },
  {
    title: "Commercial Displays",
    description:
      "Eye-catching banners and signage for retail, trade shows, and corporate events. Custom-sized displays that showcase your brand with professional quality materials.",
  },
  {
    title: "Event Decoration",
    description:
      "Transform any venue with custom event textiles. From backdrop drapes to table runners, we create pieces that match your event's theme and dimensions perfectly.",
  },
  {
    title: "Flags & Banners",
    description:
      "Custom flags for any occasion, from small desk flags to large outdoor displays. Durable materials that withstand the elements while maintaining vibrant colors.",
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
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          What We Do
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Services tailored to your needs
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
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
              <Image
                src="/hero-placeholder.svg"
                alt="Our services showcase"
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
