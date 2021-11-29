# rollup-plugin-svg-sprites

Rollup plugin for creating SVG sprites.

PS：该插件是基于 `svg-baker` 和 `svg-baker-runtime` 的，跟 `svg-sprite-loader` 同根同源，基本可以认为是从 webpack 转到 rollup 上，可以减少避免自己踩坑。

## Installation

The plugin dependencies `svg-baker`. It requires `@rollup/plugin-commonjs`.

```
// npm
npm i rollup-plugin-svg-sprites @rollup/plugin-commonjs -D

// yarn
yarn add rollup-plugin-svg-sprites @rollup/plugin-commonjs -D
```

## Usage

```
import svgSprites from 'rollup-plugin-svg-sprites'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './src/index.js',
  output: {
    format: 'esm',
    file: 'dist/bundle.js'
  },
  plugins: [
    commonjs(),
    svgSprite()
  ]
}
```

## Configuration

symbolId ((path: string) => string)

```
svgSprite({
  symbolId(path) {
    return newPath
  }
})
```

## LICENSE

[MIT](https://github.com/godxiaoji/rollup-plugin-svg-sprites/blob/master/LICENSE)
