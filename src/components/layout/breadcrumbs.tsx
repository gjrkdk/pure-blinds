import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {item.current ? (
              <span aria-current="page" className="text-foreground truncate max-w-[200px] sm:max-w-none" title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                className="py-3 transition-colors hover:text-foreground truncate max-w-[150px] sm:max-w-none"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="flex-none">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
