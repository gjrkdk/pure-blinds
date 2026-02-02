import { notFound } from "next/navigation";
import Link from "next/link";
import DimensionConfigurator from "@/components/dimension-configurator";
import { getProduct } from "@/lib/product/data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = getProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — product info + configurator */}
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {product.description}
            </p>

            <div className="mt-10">
              <DimensionConfigurator
                productId={productId}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right column — product details */}
          <div className="lg:pt-2">
            <div className="border border-border p-8 sm:p-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Product Details
              </h2>
              <dl className="mt-6 space-y-5">
                {product.details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-sm text-muted">{detail.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 border border-border p-8 sm:p-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                How It Works
              </h2>
              <ol className="mt-6 space-y-4">
                {[
                  "Enter your desired width and height",
                  "See your price calculated instantly",
                  "Add to cart and proceed to checkout",
                  "Your textile is produced and shipped",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-none font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
