const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) 서버리스 함수 크기를 대폭 줄여 주는 스탠드얼론 모드
  output: 'standalone',

  // 2) 기존 별칭 설정 유지 및 Node 네이티브 모듈 Fallback 끔
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    // 브라우저·Edge 번들에서 node:* 네이티브 모듈 무시
    if (!config.resolve.fallback) config.resolve.fallback = {};
    Object.assign(config.resolve.fallback, {
      fs: false,
      net: false,
      tls: false,
      path: false,
      http: false,
      https: false,
    });
    return config;
  },
};

module.exports = nextConfig;
