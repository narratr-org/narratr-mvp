// load local env 파일 (example은 깃에, 실제값은 .env.local 에)
require('dotenv').config({ path: './.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 설정 이어서...
  experimental: {
    appDir: true,
    runtime: 'edge',
  },
  /** 외부 라이브러리들은 서버리스 번들에서 제외(external) **/
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@supabase/supabase-js',
        'chart.js',
        'canvas'
      ];
    }
    return config;
  },
};
module.exports = nextConfig;
