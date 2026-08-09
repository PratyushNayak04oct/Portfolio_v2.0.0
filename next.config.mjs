/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow LAN / network access during local development (WSL, phone, etc.)
  allowedDevOrigins: ['172.24.213.43', '127.0.0.1', 'localhost'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  devIndicators: false,
};

export default nextConfig;
