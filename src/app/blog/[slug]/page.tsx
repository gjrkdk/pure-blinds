import { posts } from '../../../../.velite'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { MDXContent } from '@/components/mdx/mdx-content'
import { JsonLd } from '@/lib/schema/jsonld'
import { buildBlogPostSchema } from '@/lib/schema/blog'
import { buildBreadcrumbSchema } from '@/lib/schema/breadcrumb'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pure-blinds.nl';

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)

  if (!post) return {}

  return {
    title: `${post.title} | Pure Blinds`,
    description: post.excerpt,
    openGraph: {
      locale: 'nl_NL',
      type: 'article',
      title: post.title,
      description: post.excerpt,
      siteName: 'Pure Blinds',
    },
  }
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  // Build breadcrumb items for both UI and schema
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, current: true }
  ];

  // Build schemas for SEO
  const blogSchema = buildBlogPostSchema({
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    slug: post.slug,
    readingTime: post.readingTime
  }, BASE_URL);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems, BASE_URL);

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <JsonLd data={blogSchema} />
        <JsonLd data={breadcrumbSchema} />
        <Breadcrumbs items={breadcrumbItems} />

        <article className="mt-8">
          <header className="mb-8">
            <time className="text-sm text-muted">
              {format(new Date(post.date), 'd MMMM yyyy', { locale: nl })} • {post.readingTime}
            </time>
            <h1 className="mt-2 text-4xl font-light tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted">
              {post.excerpt}
            </p>
          </header>

          <div className="prose prose-neutral max-w-none md:prose-lg prose-headings:font-semibold prose-headings:tracking-tight">
            <MDXContent code={post.body} />
          </div>
        </article>
      </div>
    </div>
  )
}
