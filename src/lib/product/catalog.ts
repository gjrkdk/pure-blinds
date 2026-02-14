/**
 * Product catalog loading utilities
 */

import catalogData from '../../../data/products.json';
import type { ProductCatalog, Product, Category, Subcategory } from './types';

const catalog = catalogData as ProductCatalog;

export function getProduct(productId: string): Product | undefined {
  return catalog.products.find((p) => p.id === productId);
}

export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProductsByCategory(category: Category): Product[] {
  return catalog.products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(category: Category, subcategory: Subcategory): Product[] {
  return catalog.products.filter((p) => p.category === category && p.subcategory === subcategory);
}

export function getProductBySlug(slug: string): Product | undefined {
  return catalog.products.find((p) => p.slug === slug);
}

export function getProductUrl(product: Product): string {
  if (product.subcategory) {
    return `/products/${product.category}/${product.subcategory}/${product.slug}`;
  }
  return `/products/${product.category}/${product.slug}`;
}
