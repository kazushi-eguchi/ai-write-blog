/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時にESLintを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時にTypeScriptエラーを無視
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'thumbnail.image.rakuten.co.jp',
      'item-shopping.c.yimg.jp',
      'images-na.ssl-images-amazon.com',
      'm.media-amazon.com'
    ],
  },
}

module.exports = nextConfig