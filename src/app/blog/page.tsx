import Link from "next/link";
import Breadcrumbs from "@/components/layout/breadcrumbs";

export default function BlogPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", current: true },
          ]}
        />

        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Our Blog
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted">
            Coming soon. We're working on helpful guides about measuring,
            installation, and care for your window treatments.
          </p>
          <p className="mt-6 text-sm text-muted">
            In the meantime, browse our{" "}
            <Link
              href="/products"
              className="text-foreground hover:underline transition-colors"
            >
              Products
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
