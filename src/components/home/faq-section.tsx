"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Welke afmetingen kan ik bestellen?",
    answer:
      "Wij kunnen rolgordijnen op maat maken in vrijwel elke gewenste afmeting. Voer simpelweg uw gewenste breedte en hoogte in op de productpagina, en ons systeem berekent direct de exacte prijs voor uw specificaties.",
  },
  {
    question: "Hoe werkt de prijsberekening?",
    answer:
      "Onze prijzen worden berekend op basis van uw exacte afmetingen met een transparant matrix-gebaseerd systeem. De prijs wordt direct bijgewerkt wanneer u uw afmetingen aanpast, dus geen verrassingen — wat u ziet is wat u betaalt.",
  },
  {
    question: "Wat is het verschil tussen transparant en verduisterend?",
    answer:
      "Transparante rolgordijnen laten natuurlijk licht door terwijl ze privacy bieden, ideaal voor woonruimtes. Verduisterende (blackout) rolgordijnen blokkeren 100% van het licht en zijn perfect voor slaapkamers of thuisbioscopen waar complete duisternis gewenst is.",
  },
  {
    question: "Hoe meet ik mijn raam op?",
    answer:
      "Meet de breedte en hoogte van uw raam in millimeters. Wij adviseren om op meerdere punten te meten en de kleinste maat aan te houden. Onze productpaginas bevatten gedetailleerde meetinstructies met illustraties om u te helpen.",
  },
  {
    question: "Wat is de levertijd?",
    answer:
      "De meeste bestellingen op maat worden binnen 5-7 werkdagen geproduceerd en verzonden via een standaard vervoerder. U ontvangt trackinginformatie zodra uw bestelling is verzonden. Voor urgente projecten zijn snellere productie-opties beschikbaar.",
  },
  {
    question: "Kan ik retourneren?",
    answer:
      "Omdat elke bestelling op uw exacte specificaties wordt gemaakt, kunnen wij geen retourzendingen accepteren bij rolgordijnen op maat. Als er echter een productiefout of fout van onze kant is, vervangen wij uw bestelling kosteloos.",
  },
  {
    question: "Hoe monteer ik een rolgordijn?",
    answer:
      "Elk rolgordijn wordt geleverd met montage-instructies en alle benodigde bevestigingsmaterialen. U heeft alleen een boormachine en niveau nodig. De meeste klanten kunnen zelf monteren binnen 15-20 minuten. Wij bieden ook een professionele montageservice aan.",
  },
  {
    question: "Welke materialen gebruiken jullie?",
    answer:
      "Wij gebruiken uitsluitend premium stoffen die speciaal zijn ontwikkeld voor rolgordijnen. Ons assortiment omvat polyester-, PVC- en natuurlijke stoffen, elk geselecteerd op duurzaamheid, kleurechtheid en onderhoudsgemak.",
  },
  {
    question: "Bieden jullie korting bij grotere bestellingen?",
    answer:
      "Ja, wij bieden volumekortingen voor bestellingen van 10 stuks of meer. Neem contact met ons op met uw projectdetails voor een offerte op maat. Wij werken regelmatig samen met interieurontwerpers en bedrijven voor grootschalige installaties.",
  },
  {
    question: "Hoe onderhoud ik mijn rolgordijn?",
    answer:
      "De meeste rolgordijnen kunnen eenvoudig worden gereinigd met een vochtige doek of stofzuiger met zachte borstel. Voor hardnekkige vlekken raden wij aan om voorzichtig te deppen met een mild sopje. Vermijd agressieve schoonmaakmiddelen die de stof kunnen beschadigen.",
  },
];

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
