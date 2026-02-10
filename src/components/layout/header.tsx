'use client';

import Link from "next/link";
import CartIcon from "@/components/cart/cart-icon";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#work", label: "Our Work" },
    { href: "#contact", label: "Contact" },
  ];

  const handleMobileLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div
          className={`pointer-events-auto rounded-full bg-background/90 backdrop-blur-md shadow-lg shadow-black/[0.03] border border-border/50 transition-all duration-300 px-5 py-3 flex items-center justify-between ${
            scrolled ? "shadow-xl shadow-black/[0.06]" : ""
          }`}
        >
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-foreground hover:text-muted transition-colors"
          >
            Pure Blinds
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <CartIcon />
            <Link
              href="/products/custom-textile"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background text-sm font-medium px-5 py-2 hover:bg-foreground/85 transition-colors"
            >
              Configure
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`w-5 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[4px]" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[4px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`pointer-events-auto md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="rounded-2xl bg-background/90 backdrop-blur-md shadow-lg shadow-black/[0.03] border border-border/50 px-5 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleMobileLinkClick}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Link
                href="/products/custom-textile"
                onClick={handleMobileLinkClick}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background text-sm font-medium px-5 py-2 hover:bg-foreground/85 transition-colors"
              >
                Configure
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <CartIcon />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
