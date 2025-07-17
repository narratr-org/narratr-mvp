// 개발환경에서만 .env.local 로컬 env 변수 로드
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // heavy libs 를 외부로 분리해서 서버리스 함수 번들 슬림화
    external: ['@supabase/supabase-js', 'chart.js', 'canvas'],
  },
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
