/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow LAN / phone / Cursor Simple Browser access during local development
  allowedDevOrigins: [
    '10.183.70.43',
    '172.24.213.43',
    '127.0.0.1',
    'localhost',
  ],
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
