/**
 * Zod validation schemas for pricing inputs
 * Zero dependencies on Shopify or Next.js
 */

import { z } from 'zod';

/**
 * Validation schema for pricing API requests
 * Includes productId and dimension constraints (10-200cm range)
 */
export const PricingRequestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  width: z
    .number()
    .min(10, 'Width must be at least 10cm')
    .max(200, 'Width must not exceed 200cm'),
  height: z
    .number()
    .min(10, 'Height must be at least 10cm')
    .max(200, 'Height must not exceed 200cm'),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type PricingRequest = z.infer<typeof PricingRequestSchema>;
