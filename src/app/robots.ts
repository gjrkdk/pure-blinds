import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pure-blinds.nl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/winkelwagen', '/bevestiging'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
