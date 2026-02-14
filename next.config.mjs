import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/thank-you',
        destination: '/confirmation',
        permanent: true, // 308 status code, treated as 301 by Google
      },
      {
        source: '/products/venetian-blinds',
        destination: '/products',
        statusCode: 301,
      },
      {
        source: '/products/venetian-blinds/:path*',
        destination: '/products',
        statusCode: 301,
      },
      {
        source: '/products/textiles',
        destination: '/products',
        statusCode: 301,
      },
      {
        source: '/products/textiles/:path*',
        destination: '/products',
        statusCode: 301,
      },
    ]
  },
}

const isDev = process.argv.includes('dev')
const isBuild = process.argv.includes('build')

if (isDev || isBuild) {
  await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
