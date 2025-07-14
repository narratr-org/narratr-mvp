const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❶ ‘standalone’ 제거 → Vercel의 기본 file-tracing 으로만 복사
  webpack(config, { isServer }) {
    // ❷ Node 네이티브 모듈 polyfill 제거 (빌드 속도 & 크기↓)
    if (!config.resolve.fallback) config.resolve.fallback = {};
    ['fs', 'net', 'tls', 'path', 'http', 'https'].forEach(k => (config.resolve.fallback[k] = false));

    // ❸ 서버 번들에서 dev 전용 패키지 완전히 제외
    if (isServer) {
      config.externals.push(
        // 예: antd css loader 같은 프론트 전용 패키지
        /^chart\.js$/,
      );
    }

    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
