const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) 서버리스 함수 크기를 대폭 줄여 주는 스탠드얼론 모드
  output: 'standalone',

  // 2) 기존 별칭 설정 유지
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
