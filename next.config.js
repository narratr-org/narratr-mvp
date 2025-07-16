/** @type {import('next').NextConfig} */
// Standalone output removed to reduce bundle size
const nextConfig = {
  webpack(config, { isServer, isEdgeRuntime }) {
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
      // Serverless Function 번들에서 제외할 대형 라이브러리들
      Object.assign(config.externals, {
        '@supabase/supabase-js': 'commonjs @supabase/supabase-js',
        'chart.js': 'commonjs chart.js',
        'react-chartjs-2': 'commonjs react-chartjs-2',
      });
    }
    if (isEdgeRuntime) {
      // 1) Don’t bundle the full supabase-client into your Edge functions
      config.externals = [...(config.externals || []), '@supabase/supabase-js']

      // 2) Always resolve imports to the tiny ESM build
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
      }
    }
    return config
  },
};

module.exports = nextConfig;
