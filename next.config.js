/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // เพิ่มส่วนนี้ต่อท้ายเข้ามา
    },
  },
};

module.exports = nextConfig;