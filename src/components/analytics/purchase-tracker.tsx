'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/analytics'

export function PurchaseTracker() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('purchase_snapshot')
      if (!raw) return  // No snapshot = no purchase to track (direct navigation or no checkout)

      const { transactionId, items, totalValue } = JSON.parse(raw)
      if (!transactionId) return

      // Layer 1: sessionStorage deduplication (same browser session refresh)
      const dedupeKey = `purchase_tracked_${transactionId}`
      if (sessionStorage.getItem(dedupeKey)) return

      // Layer 2: localStorage deduplication (cross-session, e.g. bookmark + return)
      if (localStorage.getItem(dedupeKey)) return

      trackPurchase(transactionId, items, totalValue)

      // Mark as tracked in both stores
      sessionStorage.setItem(dedupeKey, '1')
      localStorage.setItem(dedupeKey, '1')

      // Clear the snapshot — purchase tracking is complete
      sessionStorage.removeItem('purchase_snapshot')
    } catch {
      // Fail silently — analytics is non-critical
    }
  }, [])

  return null  // Headless component, no UI
}
