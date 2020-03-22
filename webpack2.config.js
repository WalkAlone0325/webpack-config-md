const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

// 设置nodejs环境变量
process.env.NODE_ENV = 'development'

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 创建style标签，将样式放入
          // 'style-loader',
          // 这个loader取代style-loader。作用：提取css成单独文件
          MiniCssExtractPlugin.loader,
          // 将css文件整合到js文件中
          'css-loader',
          /*
          * css兼容性处理：postcss --> postcss-loader postcss-preset-env
          * 帮postcss找到 package.json 中 browserslist 里面的配置，通过配置加载指定的css兼容性样式
          */
          // 使用loader的默认配置
          //  'postcss-loader'
          // 修改loader配置
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => {
                // postcss 插件
                [require('postcss-preset-env')()]
              }
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // 自动修复eslint的错误
          fix: true
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 预设：指示babel做怎样的兼容性处理
          presets: [
            ['@babel/preset-env', {
              // 按需加载
              useBuiltIns: 'usage',
              // 指定 core-js 版本
              corejs: {
                version: 3
              },
              // 指定兼容性做到哪个版本浏览器
              targets: {
                chrome: '60',
                firefox: '60',
                ie: '9',
                safari: '10',
                edge: '17'
              }
            }]
          ]
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // 压缩 html 代码
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    }),
    // 新加插件，用于分离js中css并生成单独文件
    new MiniCssExtractPlugin({
      // 对输出的文件进行重命名
      filename: 'css/built.css'
    }),
    // 压缩css
    new OptimizeCssAssetsWebpackPlugin()
  ],
  mode: 'development'
}