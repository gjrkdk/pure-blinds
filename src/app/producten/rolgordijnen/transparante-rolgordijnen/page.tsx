import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { getProductsBySubcategory, getProductUrl } from "@/lib/product/catalog";

export const metadata: Metadata = {
  title: "Transparante Rolgordijnen op Maat | Pure Blinds",
  description: "Transparante rolgordijnen op maat die natuurlijk licht doorlaten met privacy. Ideaal voor woonkamer, keuken en kantoor. Bestel online met directe prijsopgave.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Transparante Rolgordijnen op Maat | Pure Blinds",
    description: "Transparante rolgordijnen op maat die natuurlijk licht doorlaten met privacy. Ideaal voor woonkamer, keuken en kantoor. Bestel online met directe prijsopgave.",
    siteName: "Pure Blinds",
  },
};

export default function TransparentRollerBlindsPage() {
  const products = getProductsBySubcategory("rolgordijnen", "transparante-rolgordijnen");
  const displayName = "Transparante Rolgordijnen";

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Producten", href: "/producten" },
            { label: "Rolgordijnen", href: "/producten/rolgordijnen" },
            { label: displayName, current: true },
          ]}
        />

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            {displayName}
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            {displayName}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Transparante rolgordijnen op maat zijn de perfecte keuze wanneer u natuurlijk licht wilt behouden terwijl u toch privacy creëert. Deze lichtdoorlatende rolgordijnen filteren het zonlicht op een subtiele manier, waardoor uw ruimte aangenaam verlicht blijft zonder verblinding of inkijk van buitenaf. Ideaal voor woonkamers waar u overdag graag een lichte en open sfeer ervaart, keukens waar natuurlijk licht essentieel is voor een prettige werkplek, of thuiskantoren waar u schermreflecties wilt voorkomen zonder de ruimte te verduisteren.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Onze transparante rolgordijnen worden op maat gemaakt uit kwalitatieve stoffen die duurzaam en onderhoudsvriendelijk zijn. Met de eenvoudige kettingbediening bepaalt u zelf exact hoeveel licht u toelaat, van volledig open tot volledig gesloten. Bestellen is eenvoudig: voer uw gewenste afmetingen in, zie direct de prijs, en ontvang binnen enkele werkdagen uw maatwerk rolgordijn thuisbezorgd.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={getProductUrl(product)}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Product image */}
                <div className="relative aspect-4/3 bg-white shadow-lifted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm text-muted">Productafbeelding</span>
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-6">
                  <h2 className="text-xl font-medium text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                    Configureer
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
