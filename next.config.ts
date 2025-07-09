/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase file upload size
    },
  },
  images: {
    domains: ['assets.entrepreneur.com'], // Allow external image host
  },
};

module.exports = nextConfig;
