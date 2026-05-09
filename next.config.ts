/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Tambahkan ini agar Base64 PDF tidak ditolak oleh Server Action
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
