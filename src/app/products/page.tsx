import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/layout/breadcrumbs";

export const metadata: Metadata = {
  title: "Producten | Pure Blinds",
  description: "Bekijk ons assortiment rolgordijnen op maat. Elk product wordt op uw exacte afmetingen gemaakt met directe online prijsberekening.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Producten | Pure Blinds",
    description: "Bekijk ons assortiment rolgordijnen op maat. Elk product wordt op uw exacte afmetingen gemaakt met directe online prijsberekening.",
    siteName: "Pure Blinds",
  },
};

interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
  image?: string;
}

const categories: Category[] = [
  {
    id: "roller-blinds",
    name: "Rolgordijnen",
    description:
      "Rolgordijnen op maat in transparante en verduisterende uitvoeringen",
    href: "/products/roller-blinds",
    image: "/png/rolgordijn-keuken.png",
  },
];

export default function ProductsPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Producten", current: true },
          ]}
        />

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Bekijk producten
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Onze producten
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Ontdek ons assortiment raamdecoratie op maat. Elk product wordt op uw exacte afmetingen gemaakt met directe online prijsberekening.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Category image */}
                <div className="relative aspect-4/3 bg-white shadow-lifted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-sm font-medium text-muted">
                        {category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category info */}
                <div className="p-6">
                  <h2 className="text-xl font-medium text-foreground">
                    {category.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {category.description}
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
