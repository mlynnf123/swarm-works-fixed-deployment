/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // This will allow TypeScript to build even with errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // This will allow ESLint to build even with warnings
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['localhost'],
  },
  // Support for static export if needed
  trailingSlash: true,
  output: 'standalone',
}

module.exports = nextConfig