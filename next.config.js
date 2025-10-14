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
}

module.exports = nextConfig