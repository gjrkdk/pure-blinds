import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand Column */}
          <div>
            <p className="text-sm font-semibold text-foreground">Custom Textiles</p>
            <p className="mt-1 text-sm text-muted">
              Made-to-measure textiles, priced instantly.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <a
                href="#about"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#services"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Services
              </a>
              <a
                href="#work"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Our Work
              </a>
              <a
                href="#contact"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <Link
                href="/products/custom-textile"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Configure
              </Link>
            </nav>
          </div>

          {/* Social Media Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              Follow Us
            </h3>
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="Pinterest"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 20l4-9" />
                  <path d="M10.7 14C11.2 13 12 11.5 12 10c0-3-2-5-5-5S2 7 2 10c0 2.5 2 5 5 5" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted">
          &copy; {new Date().getFullYear()} Custom Textiles. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
