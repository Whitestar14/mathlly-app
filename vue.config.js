const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    stats: "detailed",
  },
  devServer: {
    client: {
      webSocketURL: {
        protocol: 'wss', // Use WebSocket Secure
        hostname: 'humble-space-journey-v4r494xxrpgcpgqp.github.dev', // Replace with your Codespaces hostname
        port: 8080, // The port of your Webpack Dev Server
      },
    },
  },
});
