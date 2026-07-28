// craco.config.js
const path = require('path');

const disableHotReload = process.env.DISABLE_HOT_RELOAD === 'true';

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    configure: (webpackConfig) => {
      // Optional: kill HMR if you want stable previews
      if (disableHotReload) {
        webpackConfig.plugins = (webpackConfig.plugins || []).filter(
          (p) => p && p.constructor && p.constructor.name !== 'HotModuleReplacementPlugin'
        );
        webpackConfig.watch = false;
        webpackConfig.watchOptions = { ignored: /.*/ };
      } else {
        webpackConfig.watchOptions = {
          ...(webpackConfig.watchOptions || {}),
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**'
          ]
        };
      }
      return webpackConfig;
    }
  }
};
