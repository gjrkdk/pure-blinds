/**
 * Product catalog type definitions
 */

export type Category = 'roller-blinds';
export type Subcategory = 'transparent-roller-blinds' | 'blackout-roller-blinds';

export interface Product {
  id: string; // e.g., 'rollerblinds-white'
  name: string; // e.g., 'White Rollerblind'
  slug: string; // e.g., 'white-rollerblind' (URL-friendly)
  category: Category; // Only 'roller-blinds' allowed
  subcategory?: Subcategory; // 'transparent-roller-blinds' | 'blackout-roller-blinds'
  description: string;
  pricingMatrixPath: string; // e.g., '/data/pricing/rollerblinds-white.json'
  shopifyProductId: string; // e.g., 'gid://shopify/Product/123'
  shopifyVariantId: string; // e.g., 'gid://shopify/ProductVariant/456'
  details: { label: string; value: string }[];
}

export interface ProductCatalog {
  version: string;
  lastUpdated: string;
  products: Product[];
}
