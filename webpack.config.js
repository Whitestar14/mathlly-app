const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    publicPath: '/dist/',
    watchOptions: {
      poll: 1000,
      ignored: /node_modules/,
    },
  },
  cache: {
    type: 'filesystem', // Use persistent caching
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.jsx', '.css'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  plugins: [
    new VueLoaderPlugin(), // Necessary for vue-loader
    new webpack.DefinePlugin({
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify('false'),
    }),
  ],
};
