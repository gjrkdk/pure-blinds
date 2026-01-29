/**
 * Pure TypeScript types for the pricing domain
 * Zero dependencies on Shopify or Next.js
 */

/**
 * Configuration for a single dimension (width or height)
 */
export interface DimensionConfig {
  min: number;
  max: number;
  step: number;
  unit: 'cm';
}

/**
 * Structure of the pricing matrix JSON data file
 */
export interface PricingMatrixData {
  version: string;
  lastUpdated: string;
  description: string;
  currency: string;
  priceUnit: 'cents';
  dimensions: {
    width: DimensionConfig;
    height: DimensionConfig;
  };
  matrix: number[][];
}

/**
 * Input request for pricing calculation
 */
export interface PricingRequest {
  width: number;
  height: number;
}

/**
 * Successful pricing calculation response
 */
export interface PricingResponse {
  priceInCents: number;
  normalizedWidth: number;
  normalizedHeight: number;
  originalWidth: number;
  originalHeight: number;
}

/**
 * Error response for pricing calculation
 */
export interface PricingErrorResponse {
  error: string;
  details?: unknown;
}
