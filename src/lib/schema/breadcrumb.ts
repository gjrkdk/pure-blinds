import type { BreadcrumbList, WithContext } from 'schema-dts';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl: string
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: {
        '@type': 'ListItem';
        position: number;
        name: string;
        item?: string;
      } = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      };

      // Only add item property if href is provided and item is not current
      if (item.href && !item.current) {
        listItem.item = `${baseUrl}${item.href}`;
      }

      return listItem;
    }),
  };
}
