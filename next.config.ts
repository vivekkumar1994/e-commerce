/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false, // <-- add this line to disable buggy type checks
  images: {
    domains: ['assets.entrepreneur.com'], // enable external image domains
  },
};

module.exports = nextConfig;
