/**
 * Product catalog loading utilities
 */

import catalogData from '../../../data/products.json';
import type { ProductCatalog, Product } from './types';

const catalog = catalogData as ProductCatalog;

export function getProduct(productId: string): Product | undefined {
  return catalog.products.find((p) => p.id === productId);
}

export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProductsByCategory(category: string): Product[] {
  return catalog.products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(category: string, subcategory: string): Product[] {
  return catalog.products.filter((p) => p.category === category && p.subcategory === subcategory);
}
