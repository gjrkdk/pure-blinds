import { posts } from '../../../../.velite'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { MDXContent } from '@/components/mdx/mdx-content'

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
    title: post.title,
    description: post.excerpt
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

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title, current: true }
          ]}
        />

        <article className="mt-8">
          <header className="mb-8">
            <time className="text-sm text-muted">
              {format(new Date(post.date), 'MMMM d, yyyy')} • {post.readingTime}
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
