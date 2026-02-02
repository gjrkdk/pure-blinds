import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Custom Textiles</p>
            <p className="mt-1 text-sm text-muted">
              Made-to-measure textiles, priced instantly.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted">
            <div className="flex flex-col gap-2">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/products/custom-textile" className="hover:text-foreground transition-colors">
                Configure
              </Link>
              <Link href="/cart" className="hover:text-foreground transition-colors">
                Cart
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted">
          &copy; {new Date().getFullYear()} Custom Textiles. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
