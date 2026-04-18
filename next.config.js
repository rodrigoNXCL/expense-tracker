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
  webpack: (config, { isServer }) => config,
  turbopack: {},
  // ✅ Permitir acceso desde tu red local en desarrollo
  allowedDevOrigins: ['192.168.176.140', 'localhost']
}

module.exports = withPWA(nextConfig)