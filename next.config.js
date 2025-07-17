/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  // 서버리스 번들에서 제외할 무거운 라이브러리들
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        'chart.js',
        'canvas',
        '@supabase/supabase-js'
      );
    }
    return config;
  },
};
module.exports = nextConfig;
