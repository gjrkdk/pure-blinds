/**
 * Backward compatibility layer for product data
 * Delegates to new catalog module
 */

import { getAllProducts, getProductsByCategory as getCatalogProductsByCategory } from './catalog';
import type { Product } from './types';

// Legacy type alias for backward compatibility
export interface ProductData {
  id: string;
  name: string;
  description: string;
  category?: string;
  details: {
    label: string;
    value: string;
  }[];
}

// Convert Product to ProductData (make category optional for backward compatibility)
function toProductData(product: Product): ProductData {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    details: product.details,
  };
}

export function getProduct(productId: string): ProductData | undefined {
  const product = getAllProducts().find((p) => p.id === productId);
  return product ? toProductData(product) : undefined;
}

export function getAllProductIds(): string[] {
  return getAllProducts().map((p) => p.id);
}

export function getProductsByCategory(category: string): ProductData[] {
  return getCatalogProductsByCategory(category).map(toProductData);
}
