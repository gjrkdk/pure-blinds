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
      // Products overview
      {
        source: '/products',
        destination: '/producten',
        statusCode: 301,
      },
      // Category: roller-blinds -> rolgordijnen
      {
        source: '/products/roller-blinds',
        destination: '/producten/rolgordijnen',
        statusCode: 301,
      },
      // Subcategories
      {
        source: '/products/roller-blinds/transparent-roller-blinds',
        destination: '/producten/rolgordijnen/transparante-rolgordijnen',
        statusCode: 301,
      },
      {
        source: '/products/roller-blinds/blackout-roller-blinds',
        destination: '/producten/rolgordijnen/verduisterende-rolgordijnen',
        statusCode: 301,
      },
      // Individual products (old slug -> new slug)
      {
        source: '/products/roller-blinds/transparent-roller-blinds/roller-blind-white',
        destination: '/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn',
        statusCode: 301,
      },
      {
        source: '/products/roller-blinds/blackout-roller-blinds/roller-blind-black',
        destination: '/producten/rolgordijnen/verduisterende-rolgordijnen/zwart-rolgordijn',
        statusCode: 301,
      },
      // Old venetian-blinds and textiles redirects (updated to point to /producten)
      {
        source: '/products/venetian-blinds',
        destination: '/producten',
        statusCode: 301,
      },
      {
        source: '/products/venetian-blinds/:path*',
        destination: '/producten',
        statusCode: 301,
      },
      {
        source: '/products/textiles',
        destination: '/producten',
        statusCode: 301,
      },
      {
        source: '/products/textiles/:path*',
        destination: '/producten',
        statusCode: 301,
      },
      // Catch-all for any other /products paths (must be last)
      {
        source: '/products/:path*',
        destination: '/producten',
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
