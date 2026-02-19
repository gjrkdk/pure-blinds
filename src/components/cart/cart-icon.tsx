'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart/store'

const emptySubscribe = () => () => {}

export default function CartIcon() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const itemCount = useCartStore((state) => state.getItemCount())

  const prevCountRef = useRef(itemCount)
  const [badgePulse, setBadgePulse] = useState(false)

  useEffect(() => {
    if (mounted && itemCount !== prevCountRef.current && itemCount > 0) {
      setBadgePulse(true)
      const timer = setTimeout(() => setBadgePulse(false), 300)
      prevCountRef.current = itemCount
      return () => clearTimeout(timer)
    }
    prevCountRef.current = itemCount
  }, [itemCount, mounted])

  return (
    <Link href="/winkelwagen" className="relative inline-flex items-center" aria-label="Winkelwagen">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5 text-foreground transition-colors hover:text-muted"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>

      {mounted && itemCount > 0 && (
        <span className={`absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-accent-foreground transition-transform ${
          badgePulse ? 'scale-125' : 'scale-100'
        }`}>
          {itemCount}
        </span>
      )}
    </Link>
  )
}
