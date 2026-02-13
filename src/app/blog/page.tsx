import { posts } from '../../../.velite'
import { format } from 'date-fns'
import Link from 'next/link'
import Breadcrumbs from '@/components/layout/breadcrumbs'

export default function BlogPage() {
  const sortedPosts = posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', current: true }
          ]}
        />

        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            Guides & Tips
          </h1>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPosts.map((post) => (
            <Link
              key={post.slug}
              href={post.permalink}
              className="group"
            >
              <article className="flex flex-col h-full border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors">
                <time className="text-sm text-muted">
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </time>
                <h2 className="mt-2 text-xl font-semibold group-hover:text-neutral-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-muted line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <span className="text-sm text-muted">{post.readingTime}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
