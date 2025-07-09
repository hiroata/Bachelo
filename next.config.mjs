/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: []
  },
  swcMinify: true,
  reactStrictMode: true
};

export default nextConfig;
