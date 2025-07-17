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
  env: {
    // Provide fallback values for build process
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  },
}

module.exports = nextConfig