'use client';

import { useSyncExternalStore, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { trackViewCart } from '@/lib/analytics';

const emptySubscribe = () => () => {};

export default function CartPage() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const items = useCartStore((state) => state.items);

  // Ref guard: ensure view_cart fires only once per page visit
  const viewCartFiredRef = useRef(false);

  useEffect(() => {
    if (!mounted || viewCartFiredRef.current) return;

    // Only fire when there are non-sample items to track
    const ga4Items = items
      .filter((item) => item.type !== 'sample')
      .map((item) => ({
        item_id: item.productId,
        item_name: item.productName,
        price: item.priceInCents / 100,
        quantity: item.quantity,
        item_category: 'rolgordijnen' as const,
        ...(item.options ? { width_cm: item.options.width, height_cm: item.options.height } : {}),
      }));

    if (ga4Items.length === 0) return;

    const totalValue = items
      .filter((item) => item.type !== 'sample')
      .reduce((sum, item) => sum + (item.priceInCents * item.quantity) / 100, 0);

    viewCartFiredRef.current = true;
    trackViewCart(ga4Items, totalValue);
  }, [mounted, items]);

  if (!mounted) {
    return (
      <div className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Uw winkelwagen</h1>
          <div className="mt-10 animate-pulse space-y-6">
            <div className="h-20 bg-surface"></div>
            <div className="h-20 bg-surface"></div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Uw winkelwagen</h1>
          <div className="flex flex-col items-center py-24 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="mb-6 h-12 w-12 text-border"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <p className="text-sm text-muted">Je winkelwagen is leeg</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
            >
              Terug naar de winkel
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Uw winkelwagen
          </h1>
          <Link
            href="/producten"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Verder winkelen
          </Link>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div>
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary sidebar */}
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
