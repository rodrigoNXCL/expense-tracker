const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // ✅ Fix para Next.js 16 + Turbopack:
  // Usamos Webpack para compatibilidad con next-pwa
  webpack: (config, { isServer }) => {
    return config
  },
  // ✅ Silenciamos el warning de Turbopack explícitamente
  turbopack: {}
}

module.exports = withPWA(nextConfig)