'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import { CartItem } from '@/components/cart/cart-item';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch - show minimal layout
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <div className="animate-pulse">
          <div className="h-24 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  const handleContinueShopping = () => {
    // Navigate back if history exists, otherwise go to home
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-6 text-lg text-gray-600">Your cart is empty</p>
          <button
            onClick={handleContinueShopping}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-40">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
