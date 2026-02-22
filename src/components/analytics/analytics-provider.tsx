'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Analytics provider that fires page_view on pathname changes.
 *
 * Uses usePathname from next/navigation which strips query parameters —
 * query-param-only changes do NOT trigger a page_view (by design).
 *
 * Fires on initial mount (correct: this IS the landing page view) and on
 * every pathname change (SPA navigation without full page reload).
 *
 * Returns null — renders nothing, mounted for side effects only.
 */
export function AnalyticsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return null
}
