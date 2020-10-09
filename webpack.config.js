const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './client/index.js',
    query: './client/query.js'
 },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name]-bundle.js', // string
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080
  }
};
