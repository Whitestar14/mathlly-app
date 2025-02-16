const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    stats: "detailed",
  },
});
