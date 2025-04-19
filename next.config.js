/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Statik dışa aktarma devre dışı bırakıldı
  images: {
    domains: ['s3.tebi.io'], // Dış görsel kaynağı eklendi
    unoptimized: true,
  },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    VERCEL_URL: process.env.VERCEL_URL || ''
  }
}

module.exports = nextConfig 