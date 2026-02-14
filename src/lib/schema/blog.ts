import type { BlogPosting, WithContext } from 'schema-dts';

export interface BlogPostData {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  readingTime: string;
}

export function buildBlogPostSchema(
  post: BlogPostData,
  baseUrl: string
): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'Pure Blinds',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pure Blinds',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/svg/logo.svg`,
      },
    },
    url: `${baseUrl}/blog/${post.slug}`,
  };
}
