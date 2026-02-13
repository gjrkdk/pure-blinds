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
    ]
  },
}

const isDev = process.argv.includes('dev')
const isBuild = process.argv.includes('build')

if (isDev || isBuild) {
  await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
