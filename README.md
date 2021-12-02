# rollup-plugin-svg-sprites

Rollup plugin for creating SVG sprites.

PS：该插件是基于 `svg-baker` 和 `svg-baker-runtime` 的，跟 `svg-sprite-loader` 同根同源，基本可以认为是从 webpack 转到 rollup 上，可以减少避免自己踩坑。

## Installation

The plugin dependencies `svg-baker`. It requires `@rollup/plugin-commonjs`.

```
// npm
npm i rollup-plugin-svg-sprites -D

// yarn
yarn add rollup-plugin-svg-sprites -D
```

The plugin dependencies `svg-baker`. It requires `@rollup/plugin-commonjs`.

```
// npm
npm i @rollup/plugin-commonjs -D

// yarn
yarn add @rollup/plugin-commonjs -D
```

## Usage

### Basic usage

`rollup.config.js`:

```JavaScript
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
    svgSprites()
  ]
}
```

`foo.js`:

```JavaScript
import MyIcon from './my-icon.svg'

// <svg><use xlink:href="#${MyIcon.id}"></use></svg>
```

### Be use for Vue3.x `Vite`

`vite.config.js `:

```JavaScript
import svgSprites from 'rollup-plugin-svg-sprites'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgSprites({
      vueComponent: true,
      exclude: ['node_modules/**']
    })
  ]
})
```

`Vue SFC`:

```Vue
<template>
  <MyIcon />
</template>

<script setup>
import MyIcon from './my-icon.svg'
</script>
```

### A large number of SVGs

eg from [vfox](https://github.com/godxiaoji/vfox):

1. `rollup.config.js`:

```JavaScript
import svgSprites from 'rollup-plugin-svg-sprites'
import requireContext from '@godxiaoji/rollup-plugin-require-context'

function kebabCase2PascalCase(name) {
  name = name.replace(/-(\w)/g, (all, letter) => {
    return letter.toUpperCase()
  })
  return name.substr(0, 1).toUpperCase() + name.substr(1)
}

export default {
  input: './src/load-svg.js',
  output: {
    format: 'esm',
    file: `lib/load-svg.js`,
    banner: '/* eslint-disable */'
  },
  plugins: [
    requireContext(),
    svgSprites({
      symbolId(filePath) {
        const paths = filePath
          .replace(/\\/g, '/')
          .split('assets/icons/')[1]
          .split('/')

        const fileName = paths.pop().replace('.svg', '')
        return (
          'icon-' + kebabCase2PascalCase([fileName].concat(paths).join('-'))
        )
      }
    })
  ],
}
```

2. `./src/load-svg.js`:

```JavaScript
const req = require.context('./assets/icons', true, /\.svg$/)
```

3. Output the library:

```
rollup -c
```

4. Use in `Vue SFC`:

```Vue
<template>
  <svg>
    <use xlink:href="#icon-My"></use>
  </svg>
</template>

<script setup>
import './lib/load-svg'
</script>
```

## Configuration

### symbolId: (path: string) => string

How <symbol> id attribute should be named.

eg:

```JavaScript
svgSprite({
  symbolId(path, query) {
    return path.basename(path)
  }
})
```

### exclude: string | string[]

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_.

### include: string | string[]

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on.

### vueComponent: boolean

Default: `false`

If true, when import "_.svg" will return a Vue3.x Component. Priority level is weaker than import "_.svg?vueComponent".

### jsx: boolean

Default: `false`

If true, when import "_.svg" will return a JSX Function. Priority level is weaker than import "_.svg?jsx".

PS: 

- It use the new [JSX transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html), so the react version requirement is `>=17.0.0`, `>=16.14.0` or `>=15.7.0`.
- If JSX is used in Vue, "vueComponent" should be used instead.

## LICENSE

[MIT](https://github.com/godxiaoji/rollup-plugin-svg-sprites/blob/master/LICENSE)
