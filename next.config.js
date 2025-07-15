/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的エクスポート用
  // output: 'export',
  
  // 通常のSSR用（Render.com等）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // During production build, we'll ignore ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // During production build, we'll ignore TypeScript errors
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig