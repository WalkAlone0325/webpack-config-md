## webpack 性能优化配置

- 开发环境性能优化
- 生产环境性能优化

### 开发环境性能优化

- 优化打包构建速度
- 优化代码调试

#### HMR

> 概念：**HMR：** hot module replacement 热模块替换 / 模块热替换

作用：一个模块发生变化，只会重新打包这一个模块，而不是打包所有模块，极大的提升了构建速度

1. 样式文件：可以使用 HMR 功能：因为 style-loader 内部已经实现
2. js 文件：默认不能使用 HMR 功能：开启需要添加支持 HMR 功能的 js 代码，且只能处理 **非入口 js 文件**（入口文件将其它文件全部引入，若添加，会导致全部重新加载）
3. html 文件：默认不能使用 HMR 功能，同时会导致 **html 文件不能热更新**了
   解决：修改 **entry** 入口，将 html 文件引入

```js
module.exports = {
  // 引入html，解决热更新的问题
  entry: ['./src/js/index.js', './src/index.html'],
  devServer: {
    // 开启 HMR 功能
    // 当修改了 webpack 配置，新配置要想生效，必须重启服务
    hot: true
  }
}
```

#### source-map

> 概念：一种提供源代码构建后代码映射技术（如果构建后代码出错了，可以通过映射追踪到源代码错误）

- 参数：`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`

  - `source-map`：外部（错误代码的准确信息 和 位置）
  - `inline-source-map`：内联（只生成一个内联 source-map）（错误代码的准确信息 和 位置）
  - `hidden-source-map`：外部（直接生成 `.map` 文件）（不能追踪源代码错误，只能提示到构建后代码的错误位置）
  - `eval-source-map`：内联（每一个文件都生成对应的 source-map，都在 eval）（错误代码的准确信息 和 位置）
  - `nosources-source-map`：外部（错误代码的准确信息，没有源代码信息）
  - `cheap-source-map`：外部（错误代码的准确信息 和 位置，但只能精确到行）
  - `cheap-module-source-map`：外部（错误代码的准确信息 和 位置，会将 loader 的 source-map 加入）

- 开发环境：速度快，调试更友好。`eval-source-map` / `eval-cheap-module-source-map`

  （vue 和 react 脚手架中默认使用：`eval-source-map`）

  - 速度快：（eval > inline > cheap > ...）
    `eval-cheap-source-map`、
    `eval-source-map`、
  - 调试友好：
    `source-map`、
    `cheap-module-source-map`、
    `cheap-source-map`

- 生产环境：源代码要不要隐藏？调试要不要更友好？`source-map` / `cheap-module-source-map`

  内联会让代码体积变大，所以在生产环境中只会只用 **外部 source-map**
  `nosources-source-map`、
  `hidden-source-map`

```js
module.exports = {
  mode: 'development', // 'production'
  devtool: 'eval-source-map' // 'source-map'
}
```

#### oneOf

> oneOf：避免了每一个文件都要被 loader 过一次
> 注：不能有两个配置处理同一种类型文件

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        //优先执行
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        // 以下 loader 只会匹配一个
        oneOf: [
          ...,
          {},
          {}
        ]
      }
    ]
  }
}
```

#### cache（缓存）

1. babel 缓存
   让第二次打包构建速度更快

   ```js
   module.exports = {
     module: {
       rules: [
         {
           test: /\.js$/,
           exclude: /node_modules/,
           loader: 'babel-loader',
           options: {
             presets: [
             // 开启 babel 缓存
             // 第二次构建时，会读取之前的缓存
             cacheDirectory: true
           }
         }
       ]
     }
   }
   ```

2. 文件资源缓存
   让代码上线运行缓存更好使用
   - hash：每次 webpack 构建时会生成一个唯一的 hash 值
     问题：因为 js 和 css 是同时使用以一个 hash 值（如果重新打包会导致所有文件缓存都失效）
   - chunkhash：根据 chunk 生成 hash 值。乳沟打包来源于同一个 chunk，那么 hash 值就一样
     问题：js 和 css 的 hash 值还是一样的
     因为 css 是在 js 文件中被引入的，所以同属于一个 chunk
   - **contenthash**：根据文件的内容生成 hash 值。不同文件的 hash 值移动不一样

#### tree shaking（摇树）

> tree shaking：去除无用的代码

前提：1. 必须使用 ES6 模块化；2. 开启 production 环境
作用：减少代码体积

在 package.json 中配置：

- `"sideEffects": false` 所有的代码都没有副作用（都可以进行 tree shaking）
  问题：可能会把 css / @babel/polyfill （副作用）文件干掉
- `sideEffects: ["*.css", "*.less"]`

#### code split（代码分割）

1. 多入口形式：

   ```js
   module.exports = {
     entry: {
       // 多入口
       main: './src/js/index.js',
       test: './src/js/test.js'
     },
     output: {
       // [name]: 取文件名
       filename: 'js/[name].[contenthash:10].js',
       path: resolve(__dirname, 'build')
     },
     mode: 'production'
   }
   ```

2. optimization：

   ```js
   module.exports = {
     entry: './src/js/index.js',,
     output: {
       filename: 'js/built.[contenthash:10].js',
       path: resolve(__dirname, 'build')
     },
     // 可以将 node_modules 中的代码单独打包一个chunk最终输出
     optimization: {
       splitChunks: {
         chunks: 'all'
       }
     }
     mode: 'production'
   }
   ```

3. **某个文件的单独打包**

   ```js
   // import动态导入语法：能将某个文件单独打包成一个 chunk
   // 此处的注释可以命名打包后文件名
   import(/* webpackChunkName: 'test' */ './test.js')
     .then(() => {})
     .catch(() => {})
   ```

#### 懒加载 和 预加载

```js
// import动态导入语法：能将某个文件单独打包成一个 chunk
// webpackChunkName 此处的注释可以命名打包后文件名，webpackPrefetch 预加载
import(/* webpackChunkName: 'test', webpackPrefetch: true */ './test.js')
  .then(() => {})
  .catch(() => {})
```

### 生产环境性能优化

- 优化打包构建速度
- 优化代码运行的性能
