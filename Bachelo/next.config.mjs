/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! 警告 !!
    // 型エラーを無視してビルドを通す
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintエラーも無視
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
