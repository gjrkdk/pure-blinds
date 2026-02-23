"use client";

import { useState, useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/pricing/calculator";
import { trackBeginCheckout } from "@/lib/analytics";

const emptySubscribe = () => () => {};

function decorateWithGlLinker(url: string): string {
  try {
    const win = window as Window & {
      google_tag_data?: {
        glBridge?: {
          generate: (cookies: Record<string, string>) => string
        }
      }
    }

    if (!win.google_tag_data?.glBridge?.generate) return url

    const getCookie = (name: string): string | undefined => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
      return match ? decodeURIComponent(match[1]) : undefined
    }

    const gaClientId = getCookie('_ga')
    if (!gaClientId) return url

    const cookies: Record<string, string> = {
      _ga: gaClientId.replace(/^GA\d+\.\d+\./, ''),
    }

    const measurementId = process.env.NEXT_PUBLIC_GA4_ID?.replace('G-', '')
    if (measurementId) {
      const sessionCookie = getCookie(`_ga_${measurementId}`)
      if (sessionCookie) {
        cookies[`_ga_${measurementId}`] = sessionCookie.replace(/^GS\d+\.\d+\./, '')
      }
    }

    const glParam = win.google_tag_data.glBridge.generate(cookies)
    if (!glParam) return url

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_gl=${encodeURIComponent(glParam)}`
  } catch {
    return url
  }
}

export function CartSummary() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const items = useCartStore((state) => state.items);

  if (!mounted) {
    return null;
  }

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const transactionId = `pb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    await trackBeginCheckout(
      items.map(item => ({
        item_id: item.productId,
        item_name: item.productName,
        price: item.priceInCents / 100,
        quantity: item.quantity,
      })),
      getTotalPrice() / 100
    )

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (response.ok && data.invoiceUrl) {
        const snapshot = {
          transactionId,
          items: items.map(item => ({
            item_id: item.productId,
            item_name: item.productName,
            price: item.priceInCents / 100,
            quantity: item.quantity,
          })),
          totalValue: getTotalPrice() / 100,
        }
        sessionStorage.setItem('purchase_snapshot', JSON.stringify(snapshot))

        useCartStore.getState().clearCart();
        localStorage.removeItem("checkout_started");
        window.location.href = decorateWithGlLinker(data.invoiceUrl);
      } else {
        setError(
          data.error || "Kan bestelling niet verwerken. Probeer het opnieuw.",
        );
        setLoading(false);
      }
    } catch {
      setError("Kan bestelling niet verwerken. Probeer het opnieuw.");
      setLoading(false);
    }
  };

  return (
    <div className="border border-border p-6 sm:p-8 lg:sticky lg:top-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        Besteloverzicht
      </h2>

      <div className="mt-6 space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Subtotaal ({itemCount} {itemCount === 1 ? "artikel" : "artikelen"})
          </span>
          <span className="font-medium text-foreground">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Verzending</span>
          <span className="text-muted">Berekend bij afrekenen</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Totaal</span>
        <span className="text-lg font-medium text-foreground">
          {formatPrice(totalPrice)}<span className="text-xs font-normal text-muted ml-1">incl. BTW</span>
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || itemCount === 0}
        className="mt-6 w-full min-h-11 bg-accent py-3 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></span>
            Bestelling voorbereiden...
          </span>
        ) : (
          "Afrekenen"
        )}
      </button>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
