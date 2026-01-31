import { CartItem } from '@/lib/cart/types';

/** Request body for POST /api/checkout */
export interface CheckoutRequest {
  items: CartItem[];
}

/** Successful response from POST /api/checkout */
export interface CheckoutResponse {
  invoiceUrl: string;
}

/** Error response from POST /api/checkout */
export interface CheckoutErrorResponse {
  error: string;
}
