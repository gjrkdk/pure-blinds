/**
 * Pure pricing calculator functions
 * Zero dependencies on Shopify or Next.js
 */

import type { PricingResponse, PricingMatrixData } from './types';
import pricingData from '../../../data/pricing-matrix.json';

// Type assertion to ensure JSON matches our interface
const pricing = pricingData as PricingMatrixData;

/**
 * Normalizes a dimension to the nearest 10cm increment (rounded up)
 * Examples: 71 -> 80, 80 -> 80, 10 -> 10, 10.1 -> 20
 */
export function normalizeDimension(dimension: number): number {
  return Math.ceil(dimension / 10) * 10;
}

/**
 * Converts a normalized dimension (10, 20, ..., 200) to matrix index (0, 1, ..., 19)
 * Formula: (normalizedDimension / 10) - 1
 */
export function dimensionToIndex(normalizedDimension: number): number {
  return normalizedDimension / 10 - 1;
}

/**
 * Calculates price for given dimensions using the pricing matrix
 * Normalizes dimensions, performs bounds checking, and returns price in integer cents
 *
 * @throws Error if dimensions are out of bounds for the matrix
 */
export function calculatePrice(width: number, height: number): PricingResponse {
  // Normalize both dimensions to nearest 10cm increment
  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height);

  // Convert to matrix indices
  const widthIndex = dimensionToIndex(normalizedWidth);
  const heightIndex = dimensionToIndex(normalizedHeight);

  // Bounds check for width
  if (widthIndex < 0 || widthIndex >= pricing.matrix.length) {
    throw new Error(
      `Width dimension ${width}cm (normalized to ${normalizedWidth}cm) is out of bounds. ` +
        `Valid range: ${pricing.dimensions.width.min}-${pricing.dimensions.width.max}cm`
    );
  }

  // Bounds check for height
  if (heightIndex < 0 || heightIndex >= pricing.matrix[0].length) {
    throw new Error(
      `Height dimension ${height}cm (normalized to ${normalizedHeight}cm) is out of bounds. ` +
        `Valid range: ${pricing.dimensions.height.min}-${pricing.dimensions.height.max}cm`
    );
  }

  // Lookup price from matrix (already in integer cents)
  const priceInCents = pricing.matrix[widthIndex][heightIndex];

  return {
    priceInCents,
    normalizedWidth,
    normalizedHeight,
    originalWidth: width,
    originalHeight: height,
  };
}

/**
 * Formats integer cents as a currency string
 * This is the ONLY place cents are converted to dollars (for display only)
 * Example: 1000 -> "$10.00"
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
