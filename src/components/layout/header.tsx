import Link from "next/link";
import CartIcon from "@/components/cart/cart-icon";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground hover:text-muted transition-colors"
        >
          Custom Textiles
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/products/custom-textile"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Configure
          </Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}
