import Link from "next/link";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  return (
    <div className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-lg text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-8 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Thank you for your order
        </h1>

        {order_id && (
          <p className="mt-3 font-mono text-sm text-muted">
            Order {order_id}
          </p>
        )}

        <p className="mt-4 text-base text-muted">
          Your custom textile is on its way to being made.
        </p>

        {/* What happens next */}
        <div className="mx-auto mt-14 max-w-sm text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            What happens next
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                step: "01",
                title: "Order confirmation",
                description:
                  "You'll receive an email with your order details shortly.",
              },
              {
                step: "02",
                title: "Production",
                description:
                  "Your textile is cut to your exact dimensions and finished.",
              },
              {
                step: "03",
                title: "Shipping",
                description:
                  "Once ready, your order is packed and shipped to your address.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex-none font-mono text-xs text-muted pt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/"
          className="mt-14 inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
