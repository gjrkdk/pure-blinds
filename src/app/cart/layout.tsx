import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Winkelwagen | Pure Blinds',
  description: 'Bekijk en beheer uw geselecteerde rolgordijnen op maat. Ga verder naar de kassa om uw bestelling af te ronden.',
  openGraph: {
    locale: 'nl_NL',
    type: 'website',
    title: 'Winkelwagen | Pure Blinds',
    description: 'Bekijk en beheer uw geselecteerde rolgordijnen op maat.',
    siteName: 'Pure Blinds',
  },
  robots: { index: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
