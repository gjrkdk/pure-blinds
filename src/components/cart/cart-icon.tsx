'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart/store'

const emptySubscribe = () => () => {}

export default function CartIcon() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <Link href="/winkelwagen" className="relative inline-flex items-center">
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
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>

      {mounted && itemCount > 0 && (
        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-accent-foreground">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
