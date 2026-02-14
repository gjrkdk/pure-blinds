"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What dimensions can I order?",
    answer:
      "We can create custom roller blinds to virtually any dimension you need. Simply enter your desired width and height on the product page, and our system will calculate the exact price for your specifications.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Our pricing is calculated based on your exact dimensions using a transparent matrix-based system. The price updates instantly as you adjust your measurements, so there are no surprises — what you see is what you pay.",
  },
  {
    question: "What fabrics are available?",
    answer:
      "We offer a curated selection of premium fabrics suitable for transparent and blackout roller blinds. Each product page shows the available fabric options with details about weight, opacity, and ideal uses.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most custom orders are produced within 5-7 business days and shipped via standard carrier. You'll receive tracking information once your order ships. Express production options are available for time-sensitive projects.",
  },
  {
    question: "Can I return custom orders?",
    answer:
      "Because every order is made to your exact specifications, we cannot accept returns on custom-sized roller blinds. However, if there's a manufacturing defect or error on our part, we'll gladly replace your order at no charge.",
  },
  {
    question: "Do you offer bulk discounts?",
    answer:
      "Yes, we provide volume pricing for orders of 10 or more units. Contact us with your project details for a custom quote. We work with interior designers, event planners, and businesses on large-scale installations.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Left column: Intro */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground">
              Everything you need to know
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Have questions about ordering custom roller blinds? Find answers to the
              most common questions about dimensions, pricing, fabrics, and
              delivery.
            </p>
          </div>

          {/* Right column: Accordion */}
          <div className="mt-12 lg:mt-0">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.question}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between border-b border-border py-5 text-left"
                >
                  <span className="text-base font-medium text-foreground">
                    {item.question}
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
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
