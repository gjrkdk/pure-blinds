"use client";

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
  ];

  const handleMobileLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center px-4 pt-3">
        <div
          className={`pointer-events-auto rounded-full bg-background/90 backdrop-blur-md shadow-lg shadow-black/[0.03] border border-border/50 transition-all duration-300 px-6 py-3 flex items-center gap-4 ${
            scrolled ? "shadow-xl shadow-black/[0.06]" : ""
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground hover:text-muted transition-colors"
          >
            <img src="/logo.svg" alt="Pure Blinds" className="h-6 w-6" />
            Pure Blinds
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <CartIcon />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 focus:outline-none"
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
          className={`pointer-events-auto md:hidden overflow-hidden transition-all duration-300 w-full ${
            menuOpen ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="rounded-2xl bg-background/90 backdrop-blur-md shadow-lg shadow-black/[0.03] border border-border/50 px-5 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleMobileLinkClick}
                className="text-sm text-muted hover:text-foreground transition-colors"
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
