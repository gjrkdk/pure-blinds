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
  title: "Custom Roller Blinds — Made to Measure",
  description:
    "Order custom roller blinds online. Instant pricing, premium materials, delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
