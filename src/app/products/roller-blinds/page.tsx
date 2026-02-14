import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Rolgordijnen op Maat | Pure Blinds",
  description: "Ontdek ons assortiment rolgordijnen op maat. Transparante en verduisterende uitvoeringen met directe prijsberekening en snelle levering.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Rolgordijnen op Maat | Pure Blinds",
    description: "Ontdek ons assortiment rolgordijnen op maat. Transparante en verduisterende uitvoeringen met directe prijsberekening en snelle levering.",
    siteName: "Pure Blinds",
  },
};

interface Subcategory {
  id: string;
  name: string;
  description: string;
  href: string;
  image?: string;
}

const subcategories: Subcategory[] = [
  {
    id: "transparent-roller-blinds",
    name: "Transparante Rolgordijnen",
    description:
      "Lichtdoorlatende rolgordijnen die natuurlijk licht doorlaten met privacy",
    href: "/products/roller-blinds/transparent-roller-blinds",
    image: "/png/transparant-rolgordijn-keuken.png",
  },
  {
    id: "blackout-roller-blinds",
    name: "Verduisterende Rolgordijnen",
    description: "Blokkeert tot 99% van het licht voor complete duisternis en privacy",
    href: "/products/roller-blinds/blackout-roller-blinds",
    image: "/png/verduisterend-rolgordijn-slaapkamer.png",
  },
];

export default function RollerBlindsPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Producten", href: "/products" },
            { label: "Rolgordijnen", current: true },
          ]}
        />

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Rolgordijnen
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Rolgordijnen op Maat
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Ontdek de mogelijkheden van rolgordijnen op maat, perfect afgestemd op uw wensen en interieur. Of u nu kiest voor een transparante uitvoering die het zonlicht zacht filtert, of voor een verduisterend rolgordijn dat complete duisternis biedt — bij Pure Blinds vindt u altijd de ideale oplossing voor uw ramen.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Onze rolgordijnen worden vervaardigd uit hoogwaardige stoffen en zijn verkrijgbaar in stijlvolle kleuren die passen bij elke ruimte. Van de woonkamer tot de slaapkamer, van de keuken tot de thuiswerkplek — met een rolgordijn op maat creëert u niet alleen de gewenste lichtinval en privacy, maar voegt u ook een verfijnde afwerking toe aan uw interieur. Dankzij de eenvoudige kettingbediening regelt u moeiteloos hoeveel licht u binnenlaat.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Bestellen bij Pure Blinds is verrassend eenvoudig. U voert uw gewenste breedte en hoogte in, en onze slimme prijscalculator toont direct de exacte prijs voor uw maatwerk rolgordijn. Geen verrassingen achteraf, maar volledige transparantie vanaf het eerste moment. Na uw bestelling gaan wij direct aan de slag met de productie, en binnen 3 tot 5 werkdagen ontvangt u uw rolgordijn thuisbezorgd. Montage is eenvoudig — zowel binnen als buiten de dag mogelijk — en onderhoud vraagt weinig aandacht. Een vochtige doek is voldoende om uw rolgordijn er jarenlang prachtig uit te laten zien.
          </p>
        </div>

        {/* Subcategory grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={subcategory.href}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Subcategory image */}
                <div className="relative aspect-4/3 bg-white shadow-lifted">
                  {subcategory.image ? (
                    <Image
                      src={subcategory.image}
                      alt={subcategory.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm font-medium text-muted">
                        {subcategory.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subcategory info */}
                <div className="p-6">
                  <h2 className="text-xl font-medium text-foreground">
                    {subcategory.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {subcategory.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                    Bekijk producten
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
