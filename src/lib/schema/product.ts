import type { Product as SchemaProduct, WithContext } from 'schema-dts';
import type { Product } from '@/lib/product/types';
import type { PricingMatrixData } from '@/lib/pricing/types';

export function buildProductSchema(
  product: Product,
  pricingMatrix: PricingMatrixData,
  baseUrl: string
): WithContext<SchemaProduct> {
  // Calculate minimum price from pricing matrix
  const minPriceCents = Math.min(...pricingMatrix.matrix.flat());
  const minPrice = (minPriceCents / 100).toFixed(2);

  // Build product URL with full hierarchical path
  const productUrl = `${baseUrl}/producten/${product.category}/${product.subcategory}/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      price: minPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    brand: {
      '@type': 'Brand',
      name: 'Pure Blinds',
    },
  };
}
