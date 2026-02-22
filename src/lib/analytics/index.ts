import { sendGtagEvent, GA_MEASUREMENT_ID } from './gtag'

/**
 * Track a page view event in GA4.
 *
 * Sends only the URL path — no page title (locked decision).
 * Called by AnalyticsProvider on every pathname change (query param changes excluded).
 *
 * Phase 24 will add: trackViewItem(), trackAddToCart(), trackBeginCheckout(), trackPurchase()
 * Phase 25 will add: updateConsent()
 */
export function trackPageView(pathname: string): void {
  sendGtagEvent('page_view', { page_location: pathname })
}

// Re-export GA_MEASUREMENT_ID for conditional Script tag rendering in layout
export { GA_MEASUREMENT_ID }
