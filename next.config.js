/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的エクスポート用
  // output: 'export',
  
  // 通常のSSR用（Vercel/Render）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig