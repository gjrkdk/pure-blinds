"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq-items";

export function FaqSection() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section id="faq" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Centered header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Veelgestelde vragen
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground">
            Alles wat u moet weten
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Heeft u vragen over het bestellen van rolgordijnen op maat? Vind
            antwoorden op de meest gestelde vragen over afmetingen, prijzen,
            materialen en levering.
          </p>
        </div>

        {/* Grid of FAQ items */}
        <div className="mt-14 grid items-start gap-6 sm:grid-cols-2">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={item.question}
              className="cursor-pointer rounded-lg border border-border p-6"
              onClick={() => toggleFaq(index)}
            >
              <div
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-base font-medium text-foreground pr-4">
                  {item.question}
                </span>
                <svg
                  className="h-5 w-5 shrink-0 text-foreground transition-transform duration-300"
                  style={{
                    transform:
                      openItems[index] ? "rotate(45deg)" : "rotate(0deg)",
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
              </div>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openItems[index] ? "12rem" : "0",
                }}
              >
                <p className="pt-4 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
