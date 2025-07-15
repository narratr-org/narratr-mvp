/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
      path: false,
      net: false,
      tls: false,
      child_process: false,
      http: false,
      https: false,
      url: false,
    };
    return config;
  },
};

module.exports = nextConfig;
