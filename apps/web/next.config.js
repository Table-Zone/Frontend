/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/v1').replace('/v1', '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      // Uploads are served directly from the API base URL via getImageUrl() helper
    ];
  },
};

module.exports = nextConfig;
