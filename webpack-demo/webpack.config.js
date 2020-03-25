const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'built.js',
    path: resolve(__dirname, 'build'),
    publicPath: '/',
    chunkFilename: 'js/[name]_chunk.js', // 非入口 chunk 名称
    library: '[name]', // 整个库向外暴露的变量名
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  mode: 'development'
}