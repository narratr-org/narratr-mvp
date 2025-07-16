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
    }
    if (isEdgeRuntime) {
      // don’t bundle full Supabase SDK
      config.externals = [...(config.externals || []), '@supabase/supabase-js']
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
      }
    }
    // server-side (Node) bundles: exclude chart.js, react-chartjs-2, react-datepicker
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'chart.js',
        'react-chartjs-2',
        'react-datepicker',
      ]
    }
    return config
  },
};

module.exports = nextConfig;
