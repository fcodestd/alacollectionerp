/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Mengabaikan semua error TypeScript saat proses build (npm run build)
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Mengabaikan semua error ESLint (seperti unused vars, any, dll) saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
