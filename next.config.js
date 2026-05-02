const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: ['app-build-manifest.json'],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // ✅ Permitir acceso remoto en desarrollo
  allowedDevOrigins: [
    'localhost',
    '192.168.176.214',
    '192.168.176.140',
    '*.loca.lt',
    '*.serveo.net',
    '*.ngrok.io',
    '*.ngrok-free.app',
  ],
  // ✅ Config Turbopack vacía para silenciar warning
  turbopack: {}
}

module.exports = withPWA(nextConfig)