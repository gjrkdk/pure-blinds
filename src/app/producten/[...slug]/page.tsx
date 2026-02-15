import { notFound } from "next/navigation";
import { Metadata } from "next";
import DimensionConfigurator from "@/components/dimension-configurator";
import ProductImageGallery from "@/components/product/product-image-gallery";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import {
  getProductBySlug,
  getAllProducts,
  getProductUrl,
} from "@/lib/product/catalog";
import { JsonLd } from "@/lib/schema/jsonld";
import { buildProductSchema } from "@/lib/schema/product";
import { buildBreadcrumbSchema } from "@/lib/schema/breadcrumb";
import { loadPricingMatrix } from "@/lib/pricing/loader";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pureblinds.nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const productSlug = slug[slug.length - 1];
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} op Maat | Pure Blinds`,
    description: product.description,
    openGraph: {
      locale: "nl_NL",
      type: "website",
      title: product.name,
      description: product.description,
      siteName: "Pure Blinds",
    },
  };
}

export function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => {
    // Build slug array from product URL
    // e.g., /producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn
    // becomes ['rolgordijnen', 'transparante-rolgordijnen', 'wit-rolgordijn']
    const url = getProductUrl(product);
    const slugArray = url.split("/").filter((s) => s && s !== "producten");
    return {
      slug: slugArray,
    };
  });
}

function formatCategoryName(category: string): string {
  // Map Dutch slugs to proper display names
  const categoryMap: Record<string, string> = {
    rolgordijnen: "Rolgordijnen",
    "transparante-rolgordijnen": "Transparante Rolgordijnen",
    "verduisterende-rolgordijnen": "Verduisterende Rolgordijnen",
  };

  return (
    categoryMap[category] ||
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
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

  // Load pricing matrix for schema
  const pricingMatrix = await loadPricingMatrix(product.pricingMatrixPath);

  // Build breadcrumbs based on whether product has subcategory
  const breadcrumbItems: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }> = [
    { label: "Home", href: "/" },
    { label: "Producten", href: "/producten" },
    {
      label: formatCategoryName(product.category),
      href: `/producten/${product.category}`,
    },
  ];

  // Add subcategory breadcrumb if product has one
  if (product.subcategory) {
    breadcrumbItems.push({
      label: formatCategoryName(product.subcategory),
      href: `/producten/${product.category}/${product.subcategory}`,
    });
  }

  // Add product name as current page
  breadcrumbItems.push({ label: product.name, current: true });

  // Build schemas for SEO
  const productSchema = buildProductSchema(product, pricingMatrix, BASE_URL);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems, BASE_URL);

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <JsonLd data={productSchema} />
        <JsonLd data={breadcrumbSchema} />
        <Breadcrumbs items={breadcrumbItems} />

        {/* Product image + info section */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — product image */}
          <div>
            <ProductImageGallery
              image={product.image}
              images={product.images}
              alt={product.name}
            />
          </div>

          {/* Right column — product name, description, USPs, configurator */}
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {product.description}
            </p>

            {/* USPs */}
            {product.usps && product.usps.length > 0 && (
              <div className="mt-6 space-y-3">
                {product.usps.map((usp, i) => (
                  <div key={i} className="flex gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 flex-none text-accent"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-sm text-foreground">{usp}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10">
              <DimensionConfigurator
                productId={product.id}
                productName={product.name}
              />
            </div>
          </div>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-12 border border-border rounded-lg p-8 sm:p-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Specificaties
            </h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {product.specifications.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-sm text-muted">{spec.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
