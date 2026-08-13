/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["ioredis"],
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

export default nextConfig
