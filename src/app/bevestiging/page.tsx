import type { Metadata } from 'next'
import Link from "next/link";
import { PurchaseTracker } from '@/components/analytics/purchase-tracker'

export const metadata: Metadata = {
  title: 'Bestelling Bevestigd | Pure Blinds',
  description: 'Uw bestelling voor rolgordijnen op maat is bevestigd. Bekijk de volgende stappen.',
  openGraph: {
    locale: 'nl_NL',
    type: 'website',
    title: 'Bestelling Bevestigd | Pure Blinds',
    description: 'Uw bestelling voor rolgordijnen op maat is bevestigd.',
    siteName: 'Pure Blinds',
  },
  robots: { index: false },
}

export default function ConfirmationPage() {
  return (
    <div className="px-6 py-20 sm:py-28">
      <PurchaseTracker />
      <div className="mx-auto max-w-lg text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-8 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Bedankt voor uw bestelling
        </h1>

        <p className="mt-4 text-base text-muted">
          Uw rolgordijn op maat wordt nu geproduceerd.
        </p>

        {/* What happens next */}
        <div className="mx-auto mt-14 max-w-sm text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Wat er nu gebeurt
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                step: "01",
                title: "Bevestiging",
                description:
                  "U ontvangt binnenkort een e-mail met uw bestelgegevens.",
              },
              {
                step: "02",
                title: "Productie",
                description:
                  "Uw rolgordijn wordt op uw exacte maten gesneden en afgewerkt.",
              },
              {
                step: "03",
                title: "Verzending",
                description:
                  "Zodra gereed wordt uw bestelling ingepakt en naar uw adres verzonden.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex-none font-mono text-xs text-muted pt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/"
          className="mt-14 inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
