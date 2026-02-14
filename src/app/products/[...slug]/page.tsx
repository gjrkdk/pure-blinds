import { notFound } from "next/navigation";
import DimensionConfigurator from "@/components/dimension-configurator";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { getProductBySlug, getAllProducts, getProductUrl } from "@/lib/product/catalog";

export function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => {
    // Build slug array from product URL
    // e.g., /products/roller-blinds/transparent-roller-blinds/roller-blind-white
    // becomes ['roller-blinds', 'transparent-roller-blinds', 'roller-blind-white']
    const url = getProductUrl(product);
    const slugArray = url.split('/').filter(s => s && s !== 'products');
    return {
      slug: slugArray,
    };
  });
}

function formatCategoryName(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // The last segment is the product slug
  const productSlug = slug[slug.length - 1];
  const product = getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  // Build breadcrumbs based on whether product has subcategory
  const breadcrumbItems: Array<{ label: string; href?: string; current?: boolean }> = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    {
      label: formatCategoryName(product.category),
      href: `/products/${product.category}`,
    },
  ];

  // Add subcategory breadcrumb if product has one
  if (product.subcategory) {
    breadcrumbItems.push({
      label: formatCategoryName(product.subcategory),
      href: `/products/${product.category}/${product.subcategory}`,
    });
  }

  // Add product name as current page
  breadcrumbItems.push({ label: product.name, current: true });

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={breadcrumbItems} />

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
                productId={product.id}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right column — product details */}
          <div className="lg:pt-2">
            <div className="border border-border p-8 sm:p-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
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
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                How It Works
              </h2>
              <ol className="mt-6 space-y-4">
                {[
                  "Enter your desired width and height",
                  "See your price calculated instantly",
                  "Add to cart and proceed to checkout",
                  "Your roller blind is produced and shipped",
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
