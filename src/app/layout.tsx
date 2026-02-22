import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://pure-blinds.nl'),
  title: "Rolgordijnen op Maat | Pure Blinds",
  description:
    "Bestel rolgordijnen op maat online. Directe prijsberekening, premium materialen, geleverd aan huis. Gratis advies en snelle levering door heel Nederland.",
  openGraph: {
    locale: "nl_NL",
    type: "website",
    title: "Rolgordijnen op Maat | Pure Blinds",
    description:
      "Bestel rolgordijnen op maat online. Directe prijsberekening, premium materialen, geleverd aan huis. Gratis advies en snelle levering door heel Nederland.",
    siteName: "Pure Blinds",
    images: [
      {
        url: "/images/rolgordijn-in-woonkamer-situatie.webp",
        width: 1200,
        height: 630,
        alt: "Rolgordijn op maat in woonkamer | Pure Blinds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rolgordijnen op Maat | Pure Blinds",
    description:
      "Bestel rolgordijnen op maat online. Directe prijsberekening, premium materialen, geleverd aan huis. Gratis advies en snelle levering door heel Nederland.",
    images: ["/images/rolgordijn-in-woonkamer-situatie.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl-NL">
      <body
        className={`${jakarta.variable} antialiased flex min-h-screen flex-col`}
      >
        <Header />
        <main className="flex-1 pt-0 md:pt-20">{children}</main>
        <Footer />
        {GA_MEASUREMENT_ID && (
          <>
            {/* Script 1: Inline — initialize dataLayer + set consent defaults BEFORE gtag.js loads */}
            <Script
              id="gtag-consent-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'analytics_storage': 'denied'
                  });
                `,
              }}
            />
            {/* Script 2: External gtag.js — loads AFTER consent defaults are set */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            {/* Script 3: Inline — gtag config and cross-domain linker for Shopify checkout */}
            <Script
              id="gtag-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                  gtag('set', 'linker', { 'domains': ['${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}'] });
                `,
              }}
            />
          </>
        )}
        {/* AnalyticsProvider mounted outside the GA_MEASUREMENT_ID conditional so dev console
            logging works even when GA4 is not configured. Renders null — no visual output. */}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
