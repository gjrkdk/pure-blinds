import Link from "next/link";
import Breadcrumbs from "@/components/layout/breadcrumbs";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  href: string;
}

const subcategories: Subcategory[] = [
  {
    id: "transparent-roller-blinds",
    name: "Transparent Roller Blinds",
    description: "Light-filtering blinds that let natural light through while providing privacy",
    href: "/products/roller-blinds/transparent-roller-blinds",
  },
  {
    id: "blackout-roller-blinds",
    name: "Blackout Roller Blinds",
    description: "Block up to 99% of light for complete darkness and privacy",
    href: "/products/roller-blinds/blackout-roller-blinds",
  },
];

export default function RollerBlindsPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Roller Blinds", current: true },
          ]}
        />

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Roller Blinds
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Roller Blinds
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Choose from our range of made-to-measure roller blinds. Available in transparent and blackout options.
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
                {/* Subcategory image placeholder */}
                <div className="flex aspect-[4/3] items-center justify-center bg-white shadow-lifted">
                  <span className="text-sm font-medium text-muted">
                    {subcategory.name}
                  </span>
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
                    View products
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
