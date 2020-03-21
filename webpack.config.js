// resolve 用来拼接绝对路径的方法
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // webpack 配置
  // 入口起点
  entry: './src/index.js',
  // 输出
  output: {
    // 输出文件名
    filename: 'built.js',
    // 输出路径
    // __dirname nodejs变量，代表当前文件的目录绝对路径
    path: resolve(__dirname, 'build')
  },
  // loader 配置
  module: {
    rules: [
      // 详细 loader 配置
      {
        // 匹配哪些文件
        test: /\.css$/,
        // 使用哪些 loader 进行处理
        // use 数组中loader执行顺序：从右到左，从下到上 依次执行
        use: [
          // 创建style标签，将js中的样式资源插入进行，添加到 head 中生效
          'style-loader',
          // 将css文件变成 commonjs 模块加载到js中，里面内容是样式字符串
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        // 要使用多个 loader 用 use
        use: [
          'style-loader',
          'css-loader',
          // 将 less 文件编译成 css 文件
          // 需要下载 less 和 less-loader
          'less-loader'
        ]
      },
      {
        // 问题：默认处理不了 html 中的 img 图片
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        // 使用 loader
        // 下载 url-loader file-loader
        loader: 'url-loader',
        options: {
          // 图片大小 小于8kb，就会被 base64 处理
          // 优点：减少请求数量（减轻服务器压力）
          // 缺点：图片体积会更大（文件请求更慢）
          limit: 8 * 1024,
          // 问题：因为 url-loader 默认使用es6模块化解析，而 html-loader 引入图片是commonjs
          // 解析时会出问题：[object Module]
          // 解决：关闭 url-loader 的es6模块化，使用 commonjs 模块化
          esModule: false,
          // 给图片重命名
          // [hash: 10]取图片的hash的前10位
          // [ext]文件的原扩展名
          name: '[hash: 10].[ext]'
        }
      },
      {
        test: /\.html$/,
        // 下载 html-loader
        // 处理 html 文件的img图片的（负责引入 img，从而能被 url-loader 进行打包处理）
        loader: 'html-loader'
      }
    ]
  },
  // plugins 配置
  plugins: [
    // html-webpack-plugin，功能：默认会创建一个空的HTML，自动引入打包输出的所有资源（js/css）
    // 需求：需要有结构的 html 文件
    new HtmlWebpackPlugin({
      // 复制 './src/index.html' 文件，并自动引入打包输出的所有资源（js/css）
      template: './src/index.html'
    })
  ],
  // 模式
  mode: 'develpoment', // 开发模式
  // mode: 'production'
}