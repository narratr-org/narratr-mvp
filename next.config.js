/** @type {import('next').NextConfig} */
// Standalone output removed to reduce bundle size
const nextConfig = {
  webpack(config, { isServer }) {
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
    if (isServer) {
      config.externals = config.externals || {};
      config.externals['@supabase/supabase-js'] = 'commonjs @supabase/supabase-js';
    }
    return config;
  },
};

module.exports = nextConfig;
