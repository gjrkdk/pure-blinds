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
      <ol className="flex items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.current ? (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
