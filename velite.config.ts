import { defineConfig, defineCollection, s } from 'velite'
import readingTime from 'reading-time'

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.slug('blog'),
      date: s.isodate(),
      excerpt: s.excerpt(),
      body: s.mdx()
    })
    .transform((data) => ({
      ...data,
      readingTime: readingTime(data.body).text,
      permalink: `/blog/${data.slug}`
    }))
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: { posts }
})
