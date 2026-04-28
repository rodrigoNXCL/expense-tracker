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
  // ✅ Permitir acceso remoto en desarrollo
  allowedDevOrigins: [
    'localhost',
    '192.168.176.214',
    '192.168.176.140',
    '*.loca.lt',
    '*.serveo.net', 
    '*.ngrok.io',
    '*.ngrok-free.app',
  ]
}

module.exports = withPWA(nextConfig)