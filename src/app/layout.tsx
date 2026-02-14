import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
