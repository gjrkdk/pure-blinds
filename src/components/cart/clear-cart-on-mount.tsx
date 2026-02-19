'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

interface ClearCartOnMountProps {
  orderId?: string;
}

export function ClearCartOnMount({ orderId }: ClearCartOnMountProps) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (orderId && orderId.trim() !== '') {
      clearCart();
      localStorage.removeItem('checkout_started');
    }
  }, [orderId, clearCart]);

  return null;
}
