'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

export function CartSummary() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const items = useCartStore((state) => state.items);

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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (response.ok && data.invoiceUrl) {
        // Redirect to Shopify checkout in same window
        // Loading state intentionally persists until page unloads
        window.location.href = data.invoiceUrl;
      } else {
        setError(data.error || 'Unable to process checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Unable to process checkout. Please try again.');
      setLoading(false);
    }
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
          disabled={loading || itemCount === 0}
          className="w-full min-h-[44px] rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Preparing checkout...
            </span>
          ) : (
            'Proceed to Checkout'
          )}
        </button>
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
