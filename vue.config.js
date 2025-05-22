const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = defineConfig({
  publicPath: '/',
  productionSourceMap: false,
  
  pwa: {
    name: 'Mathlly',
    themeColor: '#4f46e5',
    msTileColor: '#4f46e5',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#4f46e5',
    manifestOptions: require('./public/manifest.json'),
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: false,
      clientsClaim: true,
      
      exclude: [
        /\.map$/, 
        /_redirects/, 
        /version-info\.json$/
      ],
      
      navigateFallback: '/index.html',
      
      navigateFallbackDenylist: [
        /^\/_/,
        /\/[^/?]+\.[^/]+$/,
      ],
      
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2|woff|ttf|eot)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 * 12,
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 3,
            },
          },
        },
        {
          urlPattern: /\/(?!api)/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
  },

  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 250 * 1024,
        minSize: 50 * 1024,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        hidePathInfo: true,
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: true,
            compress: true,
            output: {
              comments: false,
              drop_console: true,
            },
          },
        })
      ],
    },
    plugins: [new webpack.DefinePlugin({
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
    })],
    stats: "detailed",
    devServer: {
      compress: true,
      hot: true,
    }
  },
});