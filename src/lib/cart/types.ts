/**
 * Cart domain types
 * Pure TypeScript types - no external dependencies
 */

/**
 * A single item in the shopping cart
 */
export interface CartItem {
  /** Unique identifier: `${productId}-${optionsSignature}` */
  id: string;

  /** Product identifier */
  productId: string;

  /** Human-readable product name */
  productName: string;

  /** Original user-entered dimensions (NOT normalized) */
  options: {
    width: number;
    height: number;
  };

  /** Hash of options for uniqueness and duplicate detection */
  optionsSignature: string;

  /** Number of items with these exact dimensions */
  quantity: number;

  /** Price per single item in cents (from pricing API) */
  priceInCents: number;
}

/**
 * Input type for adding items to cart
 * Omits generated fields (id, optionsSignature, quantity)
 */
export type AddCartItemInput = Omit<CartItem, 'id' | 'optionsSignature' | 'quantity'>;
