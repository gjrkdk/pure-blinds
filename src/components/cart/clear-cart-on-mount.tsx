'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

interface ClearCartOnMountProps {
  orderId?: string;
}

export function ClearCartOnMount({ orderId }: ClearCartOnMountProps) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // If no order ID provided, the page component handles the redirect — do nothing here
    if (!orderId || orderId.trim() === '') {
      return;
    }

    const verifyAndClear = async () => {
      try {
        const response = await fetch(`/api/verify-order?order_id=${encodeURIComponent(orderId)}`);
        if (response.ok) {
          const data = await response.json() as { valid: boolean };
          if (data.valid) {
            clearCart();
            // Clean up checkout_started flag set during cart-summary checkout
            localStorage.removeItem('checkout_started');
          }
          // If not valid, cart stays intact (safe default)
        }
        // On non-ok response, cart stays intact (safe default)
      } catch {
        // Network error — cart stays intact (safe default)
      }
    };

    verifyAndClear();
  }, [orderId, clearCart]);

  return null;
}
