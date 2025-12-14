/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables that should be available on the client
  env: {
    // Add any public env vars here if needed
  },
};

module.exports = nextConfig;

