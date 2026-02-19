"use client";

import Link from "next/link";
import Image from "next/image";
import CartIcon from "@/components/cart/cart-icon";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/cart/store";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cart state for mobile badge
  const emptySubscribe = () => () => {};
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const itemCount = useCartStore((state) => state.getItemCount());

  // Track previous count to detect changes for pulse animation
  const prevCountRef = useRef(itemCount);
  const [badgePulse, setBadgePulse] = useState(false);

  useEffect(() => {
    if (mounted && itemCount !== prevCountRef.current && itemCount > 0) {
      setBadgePulse(true);
      const timer = setTimeout(() => setBadgePulse(false), 300);
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount, mounted]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/producten", label: "Producten" },
    { href: "/blog", label: "Blog" },
  ];

  const handleMobileLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center px-4 pt-3">
        <div
          className={`pointer-events-auto rounded-full bg-white shadow-lg shadow-black/8 border border-border/50 transition-all duration-300 px-8 py-4 flex items-center gap-5 ${
            scrolled ? "shadow-xl shadow-black/10" : ""
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground hover:text-muted transition-colors"
          >
            <Image
              src="/svg/logo-icon.svg"
              alt="Pure Blinds"
              height={24}
              width={24}
            />
            Pure Blinds
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:text-foreground transition-colors text-black "
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <CartIcon />
          </div>

          {/* Mobile cart icon + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/winkelwagen"
              className="relative inline-flex items-center justify-center w-8 h-8"
              aria-label="Winkelwagen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {mounted && itemCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-accent-foreground transition-transform ${
                    badgePulse ? "scale-125" : "scale-100"
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="flex flex-col items-center justify-center w-8 h-8 gap-1.5 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu openen"
            >
              <span
                className={`w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`pointer-events-auto md:hidden overflow-hidden transition-all duration-300 w-full ${
            menuOpen ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="rounded-2xl bg-white shadow-lg shadow-black/3 border border-border/50 px-5 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleMobileLinkClick}
                className="text-sm text-black hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <CartIcon />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
