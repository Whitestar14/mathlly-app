const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  
  configureWebpack: {
    plugins: [new webpack.DefinePlugin({
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
    })],
    stats: "detailed",
  },

  devServer: {
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    watchFiles: ['src/**/*', 'public/**/*'],
  },
});
