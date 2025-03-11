/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Zendesk routes (incluyendo chats)
      {
        source: '/api/zendesk/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/zendesk/:path*`,
      },
      // Users routes
      {
        source: '/api/users/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/:path*`,
      },
      // Transactions routes
      {
        source: '/api/transactions/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/:path*`,
      },
    ]
  },
  webpack: (config, { webpack }) => {
    config.ignoreWarnings = [
      {
        module: /node_modules/,
        message: /\[DEP0060\]/,
      },
    ]
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ]
  },
  experimental: {
    // Optimizaciones para páginas del dashboard
    optimizeCss: true,
    scrollRestoration: true,
    // Permitir animaciones y transiciones en cambios de páginas
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Asegurarse de que las imágenes y otros recursos se sirvan correctamente
  images: {
    domains: ['backoffice-casino-front-production.up.railway.app', 'localhost'],
  },
}

module.exports = nextConfig