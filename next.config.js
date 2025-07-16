/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone 모드로 빌드해서 .next/standalone 에만 필요한 파일 남김
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 서버리스 함수 번들에서 제외할 무거운 라이브러리
      config.externals.push(
        '@supabase/supabase-js',
        'chart.js',
        'canvas'
      );
    }
    return config;
  },
};
module.exports = nextConfig;
