import { MetadataRoute } from 'next'
import { getAllProducts, getProductUrl } from '@/lib/product/catalog'
import { posts } from '../../.velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pureblinds.nl'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/producten`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/producten/rolgordijnen`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/producten/rolgordijnen/transparante-rolgordijnen`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/producten/rolgordijnen/verduisterende-rolgordijnen`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
  ]

  // Product detail pages
  const productPages: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: `${baseUrl}${getProductUrl(product)}`,
    lastModified: new Date(),
  }))

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}${post.permalink}`,
    lastModified: new Date(post.date),
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
