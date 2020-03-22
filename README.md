## Webpack

### webpack 是什么

Webpack 是一种前端资源构建工具，一个静态模块打包器（module bundler）。
在 webpack 看来，前端的所有资源文件（js/json/css/img/less/...）都会作为模块处理。它将根据模块的依赖关系进行静态分析，打包生成对应的静态资源（bundle）。

chunk 块
bundle 包

### webpack 的五个核心概念

1. Entry
   入口（Entry）指示 webpack 以哪个文件为入口起点开始打包，分析构建内部依赖图。
2. Output
   输出（Output）指示 webpack 打包后的资源 bundles 输出到哪里去，以及如何命名。
3. Loader
   loader 让 webpack 能够去处理那些非 javascript 文件（webpack 自身只理解
   javascript）
4. Plugins
   插件（Plugins）可以是用于执行范围更广的任务。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量等。
5. Mode
   模式（Mode）指示 webpack 使用相应模式的配置。
   选项|描述|特点
   -|-|-
   development|会将 process.env.NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NameModulesPligin|能让代码本地调试运行的环境
   production|会将 process.env.NODE_ENV 的值设为 production。启用 FlagDependencyUsagePlugin，FlagDependencyChunksPlugin，ModuleConcatenationPlugin，sideEffectsFlagPlugin 和 UglifyJsPlugin|能让代码优化上线运行的环境

### 打包 js/json

1. 运行指令：

- 开发环境：webpack ./src/index.js -o ./build/built.js --mode=development
  webpack 会以./src/index.js 为入口文件开始打包，打包后输出到./build/built.js
  整体打包环境，是开发环境
- 生产环境：webpack ./src/index.js -o ./build/built.js --mode=production
  webpack 会以./src/index.js 为入口文件开始打包，打包后输出到./build/built.js
  整体打包环境，是生产环境

2. 结论：
   1. webpack 能处理 js/json 资源，不能处理 css/img 等其他资源
   2. 生产环境 和 开发环境将 ES6 模块化编译成浏览器能识别的模块化
   3. 生产环境比开发环境多一个压缩 js 代码

### 打包 css/img

loader：1. 下载 2. 使用（配置 loader）

webpack.config.js 文件
作用：指示 webpack 干哪些活
所有的构建工具都是基于 nodejs 平台运行的，模块化默认采用 commonjs 规范。

```js
// resolve 用来拼接绝对路径的方法
const resolve = require('path')

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
      // 详细 loader 配置，不同文件需要配置不同loader
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
        use: [
          'style-loader',
          'css-loader',
          // 将 less 文件编译成 css 文件
          // 需要下载 less 和 less-loader
          'less-loader'
        ]
      }
    ]
  },
  // plugins 配置
  plugins: [],
  // 模式
  mode: 'develpoment' // 开发模式
  // mode: 'production'
}
```

### 打包 html

plugins：

1.  下载：
    `npm i html-webpack-plugin -D`
2.  引入：
    `const HtmlWebpackPlugin = require('html-webpack-plugin')`
3.  使用：

```js
module.exports = {
  plugins: [
    // html-webpack-plugin，功能：默认会创建一个空的 HTML，自动引入打包输出的所有资源（js/css）
    new HtmlWebpackPlugin()
  ]
}
```

```js
module.exports = {
  plugins: [
    // html-webpack-plugin，功能：默认会创建一个空的HTML，自动引入打包输出的所有资源（js/css）
    // 需求：需要有结构的 html 文件
    new HtmlWebpackPlugin({
      // 复制 './src/index.html' 文件，并自动引入打包输出的所有资源（js/css）
      template: './src/index.html'
    })
  ]
}
```

### 打包 img 图片资源

下载：`npm i url-loader file-loader html-loade -D`

```js
module.exports = {
  // loader 配置
  module: {
    rules: [
      // 详细 loader 配置
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
  }
}
```

### 打包字体文件等

```js
module.exports = {
  module: {
    rules: [
      {
        // 打包其他资源（除了 html/js/css 以外的资源）
        // 排除的资源文件
        exclude: /\.(css|js|html)$/,
        loader: 'file-loader'
      }
    ]
  }
}
```

### 开发服务器 devServer

```js
module.exports = {
  // 开发服务器 devServer：用来 自动化（自动编译，自动打开浏览器，自动刷新浏览器等）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动 devServer指令为：npx webpack-dev-server （npm i webpack-dev-server -D）
  devServer: {
    contentBase: resolve(__dirname, 'build'),
    // 启动 gzip 压缩
    compress: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true
  }
}
```

### 开发环境基本配置

```js
module.exports = {
  entry: './src/js/index.js',
  output: {
    // 会打包到 js 文件夹下
    filename: 'js/built.js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash: 10].[ext]'
          esModule: false,
          // 会将图片打包到 img 文件夹下
          outputPath: 'img'
        }
      },
      {
        exclude: /\.(css|js|html|less|png)$/,
        loader: 'file-loader',
        outputPath: 'media'
      }
    ]
  }
}
```
