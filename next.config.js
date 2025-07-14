const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Edge 번들에서는 node:fs 등 무시
    if (!config.resolve.fallback) config.resolve.fallback = {};
    ['fs','net','tls','path','http','https'].forEach(k => (config.resolve.fallback[k] = false));
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
