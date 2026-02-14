import Link from "next/link";

export function Footer() {
  const links = [
    { label: "Rolgordijnen", href: "/products/roller-blinds" },
    { label: "Blog", href: "/blog" },
    { label: "Over ons", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:items-start">
          {/* Brand */}
          <p className="flex items-center gap-3 text-2xl font-bold tracking-tight text-accent-foreground">
            <img
              src="/svg/logo-icon-inverted.svg"
              alt="Pure Blinds"
              className="h-8 w-8"
            />
            Pure Blinds
          </p>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-accent-foreground">
              Snelle links
            </h3>
            <nav className="mt-4 grid grid-cols-2 gap-x-16 gap-y-2">
              {links.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-accent-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-accent-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-800 py-6 sm:flex-row">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Pure Blinds. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-neutral-500">
            Rolgordijnen op maat
          </p>
        </div>
      </div>
    </footer>
  );
}
