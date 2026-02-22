declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

/**
 * GA4 Measurement ID from environment variable.
 * This is intentionally undefined in dev/preview deployments where NEXT_PUBLIC_GA4_ID is not set.
 * Guard: analytics only fires when this is defined — do NOT use NODE_ENV==='production'
 * because Vercel preview deployments also have NODE_ENV=production.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID

/**
 * Send a GA4 event via gtag.
 *
 * - If GA_MEASUREMENT_ID is falsy (dev, preview): logs to console instead
 * - If GA_MEASUREMENT_ID is defined (production): calls window.gtag('event', ...)
 * - Checks for debug_mode=true URL search param and passes debug_mode in config if present
 */
export function sendGtagEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!GA_MEASUREMENT_ID) {
    // Dev / preview deployments: log what WOULD be sent to GA4
    console.log('[Analytics]', eventName, params ?? {})
    return
  }

  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  // Check for debug_mode URL param — do NOT set debug_mode:false to disable, omit entirely
  const debugMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug_mode') === 'true'

  const eventParams = debugMode
    ? { ...params, debug_mode: true }
    : params

  window.gtag('event', eventName, eventParams)
}
