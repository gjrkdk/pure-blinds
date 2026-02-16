/**
 * Cart domain types
 * Pure TypeScript types - no external dependencies
 */

/**
 * A single item in the shopping cart
 */
export interface CartItem {
  /** Unique identifier: `${productId}-${optionsSignature}` or `sample-${productId}` */
  id: string;

  /** Product identifier */
  productId: string;

  /** Human-readable product name */
  productName: string;

  /** Item type: regular product or color sample */
  type?: "product" | "sample";

  /** Original user-entered dimensions (NOT normalized) — absent for samples */
  options?: {
    width: number;
    height: number;
  };

  /** Hash of options for uniqueness and duplicate detection — absent for samples */
  optionsSignature?: string;

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

/**
 * Input type for adding a color sample to cart
 */
export type AddSampleItemInput = {
  productId: string;
  productName: string;
};
