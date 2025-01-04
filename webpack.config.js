const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080, 
    open: true,  
    hot: true, 
    publicPath: '/', 
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
      extensions: ['.js', '.jsx', '.css'], 
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify('false'),
    }),
  ],
};
