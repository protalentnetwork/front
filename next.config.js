/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Zendesk routes
      {
        source: '/zendesk/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/zendesk/:path*`,
      },
      // Chat routes
      {
        source: '/api/zendesk/chats/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/zendesk/chats/:path*`,
      },
      // Users routes
      {
        source: '/users/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/:path*`,
      },
      // Auth routes
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/:path*`,
      },
      // Transactions routes
      {
        source: '/transactions/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/:path*`,
      },
      // Cualquier otra ruta de la API
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ]
  },
  // Silenciar warnings específicos de Node.js
  webpack: (config, { webpack }) => {
    config.ignoreWarnings = [
      {
        module: /node_modules/,
        message: /\[DEP0060\]/,
      },
    ]
    return config
  },
}

export default nextConfig