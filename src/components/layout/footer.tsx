export function Footer() {
  const links = [
    { label: "About us", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Our work", href: "#our-work" },
    { label: "FAQs", href: "#faq" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:items-start">
          {/* Brand */}
          <p className="text-2xl font-bold tracking-tight text-accent-foreground">
            Pure Blinds
          </p>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-accent-foreground">
              Quick links
            </h3>
            <nav className="mt-4 grid grid-cols-2 gap-x-16 gap-y-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-accent-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-800 py-6 sm:flex-row">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Pure Blinds. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">Custom dimension textiles</p>
        </div>
      </div>
    </footer>
  );
}
