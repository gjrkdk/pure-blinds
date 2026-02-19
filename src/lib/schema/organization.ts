import type { Organization, WithContext } from 'schema-dts';

export function buildOrganizationSchema(baseUrl: string): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pure Blinds',
    url: baseUrl,
    logo: `${baseUrl}/svg/logo.svg`,
    email: 'info@pure-blinds.nl',
  };
}
