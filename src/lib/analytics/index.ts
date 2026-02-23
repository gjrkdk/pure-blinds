import { sendGtagEvent, GA_MEASUREMENT_ID } from './gtag'

/**
 * GA4 e-commerce item structure following the GA4 recommended e-commerce schema.
 *
 * price must be in EUR decimal (NOT cents) — callers must divide priceInCents by 100.
 * width_cm and height_cm are custom parameters for add_to_cart (popular size analysis).
 */
export interface GA4EcommerceItem {
  item_id: string        // product slug, e.g. "wit-rolgordijn"
  item_name: string      // product display name
  price: number          // EUR decimal, NOT cents
  quantity: number
  item_category?: string // e.g. "rolgordijnen"
  width_cm?: number      // custom param — add_to_cart only
  height_cm?: number     // custom param — add_to_cart only
}

/**
 * Track a page view event in GA4.
 *
 * Sends only the URL path — no page title (locked decision).
 * Called by AnalyticsProvider on every pathname change (query param changes excluded).
 *
 * Phase 25 will add: updateConsent()
 */
export function trackPageView(pathname: string): void {
  sendGtagEvent('page_view', { page_location: pathname })
}

/**
 * Track a view_item event when a user views a product detail page.
 *
 * Fire once per product page visit — use a useRef guard in the calling component
 * to prevent repeated firing when dimensions change and price updates.
 */
export function trackViewItem(item: GA4EcommerceItem): void {
  sendGtagEvent('view_item', {
    currency: 'EUR',
    value: item.price,
    items: [item],
  })
}

/**
 * Track an add_to_cart event when a user adds an item to the cart.
 *
 * Include width_cm and height_cm as custom parameters per locked decision
 * (useful for analyzing popular sizes).
 */
export function trackAddToCart(item: GA4EcommerceItem): void {
  sendGtagEvent('add_to_cart', {
    currency: 'EUR',
    value: item.price * item.quantity,
    items: [item],
  })
}

/**
 * Track a begin_checkout event when a user initiates checkout.
 *
 * Returns a Promise that resolves when GA4 confirms the event was sent
 * (via event_callback), or after 500ms safety timeout. Await this before
 * navigating away — gtag batches events and won't flush before page unload.
 */
export function trackBeginCheckout(items: GA4EcommerceItem[], totalValue: number): Promise<void> {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    sendGtagEvent('begin_checkout', { currency: 'EUR', value: totalValue, items })
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 500)
    sendGtagEvent('begin_checkout', {
      currency: 'EUR',
      value: totalValue,
      items,
      event_callback: () => {
        clearTimeout(timeout)
        resolve()
      },
    })
  })
}

/**
 * Track a purchase event after a successful order.
 *
 * transactionId is the Shopify order ID extracted from /bevestiging URL params.
 * Use sessionStorage deduplication flag to prevent duplicate events on page refresh.
 */
export function trackPurchase(
  transactionId: string,
  items: GA4EcommerceItem[],
  totalValue: number
): void {
  sendGtagEvent('purchase', {
    transaction_id: transactionId,
    currency: 'EUR',
    value: totalValue,
    items,
  })
}

// Re-export GA_MEASUREMENT_ID for conditional Script tag rendering in layout
export { GA_MEASUREMENT_ID }
