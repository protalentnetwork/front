/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig