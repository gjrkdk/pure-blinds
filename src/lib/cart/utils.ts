/**
 * Cart utility functions for hash generation and uniqueness
 * Browser-compatible - no Node.js dependencies
 */

/**
 * Creates a deterministic hash from dimension options
 * Used for cart item uniqueness detection
 *
 * @param options - User-entered dimensions
 * @returns Deterministic hash string
 */
export function generateOptionsSignature(options: {
  width: number;
  height: number;
}): string {
  // Create deterministic JSON string with sorted keys
  const normalized = JSON.stringify({
    height: options.height,
    width: options.width,
  });

  // Simple browser-compatible hash function
  // Not cryptographic - just needs to be deterministic and collision-resistant
  // for ~400 dimension combinations (20 widths × 20 heights)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to base36 for shorter string
  return Math.abs(hash).toString(36);
}

/**
 * Generates a unique cart item ID by combining product ID and dimensions
 * Format: ${productId}-${width}x${height}
 *
 * Examples:
 * - rollerblinds-white-150x200
 * - rollerblinds-black-150x200  (same dimensions, different product = unique ID)
 *
 * @param productId - Product identifier
 * @param options - User-entered dimensions
 * @returns Unique cart item identifier
 */
export function generateCartItemId(
  productId: string,
  options: { width: number; height: number }
): string {
  return `${productId}-${options.width}x${options.height}`;
}

/**
 * Generates a cart item ID for a color sample
 * Format: sample-${productId}
 *
 * @param productId - Product identifier
 * @returns Unique cart item identifier for the sample
 */
export function generateSampleCartItemId(productId: string): string {
  return `sample-${productId}`;
}
