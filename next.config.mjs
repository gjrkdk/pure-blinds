import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {}

const isDev = process.argv.includes('dev')
const isBuild = process.argv.includes('build')

if (isDev || isBuild) {
  await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
