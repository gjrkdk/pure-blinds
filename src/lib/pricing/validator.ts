/**
 * Zod validation schemas for pricing inputs
 * Zero dependencies on Shopify or Next.js
 */

import { z } from 'zod';

/**
 * Validation schema for dimension inputs
 * Ensures dimensions are within 10-200cm range with descriptive error messages
 */
export const DimensionInputSchema = z.object({
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
export type DimensionInput = z.infer<typeof DimensionInputSchema>;
