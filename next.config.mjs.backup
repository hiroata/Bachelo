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
  },
  // 静的生成の設定
  output: 'standalone',
  // 特定のページを静的生成から除外
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Render最適化: 静的アセットのキャッシュ設定
  async headers() {
    return [
      {
        // 静的アセット（画像、フォント等）に長期キャッシュを設定
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // CSSとJSファイルにもキャッシュを設定
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // APIルートはキャッシュしない
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // 圧縮を有効化
  compress: true,
  // 本番環境でのソースマップ生成を無効化（パフォーマンス向上）
  productionBrowserSourceMaps: false,
};

export default nextConfig;
