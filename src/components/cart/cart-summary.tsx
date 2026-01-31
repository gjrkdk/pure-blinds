'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

export function CartSummary() {
  const [mounted, setMounted] = useState(false);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getItemCount = useCartStore((state) => state.getItemCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch
    return null;
  }

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleCheckout = () => {
    // Non-functional until Phase 5
    alert('Checkout coming soon');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={itemCount === 0}
          className="w-full min-h-[44px] rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
