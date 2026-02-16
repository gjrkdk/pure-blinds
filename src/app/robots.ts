import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pureblinds.nl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/winkelwagen', '/bevestiging'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
