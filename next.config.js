// 개발환경에서만 .env.local 로컬 env 변수 로드
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Serverless 번들 크기 줄이기 위해 heavy libs 외부화
    config.externals = [
      '@supabase/supabase-js',
      'chart.js',
      'canvas'
    ];
    return config;
  },
};
module.exports = nextConfig;
