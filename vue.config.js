const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = defineConfig({
  publicPath: '/',
  productionSourceMap: false,
  
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 1000000,
        minSize: 500000,
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
        }})
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
