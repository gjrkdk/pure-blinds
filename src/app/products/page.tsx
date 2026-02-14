import Link from "next/link";
import Breadcrumbs from "@/components/layout/breadcrumbs";

interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
}

const categories: Category[] = [
  {
    id: "roller-blinds",
    name: "Roller Blinds",
    description: "Made-to-measure roller blinds in transparent and blackout options",
    href: "/products/roller-blinds",
  },
  {
    id: "venetian-blinds",
    name: "Venetian Blinds",
    description: "Classic venetian blinds in various sizes",
    href: "/products/venetian-blinds",
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Premium custom-dimension textiles",
    href: "/products/textiles",
  },
];

export default function ProductsPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", current: true },
          ]}
        />

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Browse Products
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Explore our range of made-to-measure window treatments. Each
            product is custom-crafted to your exact dimensions with instant
            pricing.
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
                {/* Category image placeholder */}
                <div className="flex aspect-[4/3] items-center justify-center bg-white shadow-lifted">
                  <span className="text-sm font-medium text-muted">
                    {category.name}
                  </span>
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
