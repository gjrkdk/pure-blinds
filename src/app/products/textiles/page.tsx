import Link from "next/link";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { getProductsByCategory } from "@/lib/product/catalog";

export default function TextilesPage() {
  const category = "textiles";
  const products = getProductsByCategory(category);
  const displayName = "Textiles";

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
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
            Browse our collection of made-to-measure {displayName.toLowerCase()}. Choose your
            product and configure your exact dimensions for a perfect fit.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Product image placeholder */}
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-white shadow-lifted">
                  <span className="text-sm text-muted">Product Image</span>
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
                    Configure
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
