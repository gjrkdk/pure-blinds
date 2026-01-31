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
 * Generates a unique cart item ID by combining product ID and options hash
 *
 * @param productId - Product identifier
 * @param options - User-entered dimensions
 * @returns Unique cart item identifier
 */
export function generateCartItemId(
  productId: string,
  options: { width: number; height: number }
): string {
  const signature = generateOptionsSignature(options);
  return `${productId}-${signature}`;
}
