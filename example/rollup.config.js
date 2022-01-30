import { nodeResolve } from '@rollup/plugin-node-resolve'
import svgSprites from '../lib/index.mjs'

export default [
  {
    input: './example/src/index.js',
    output: {
      format: 'esm',
      file: 'example/dist/index.js'
    },
    plugins: [nodeResolve(), svgSprites()]
  },
  {
    input: './example/src/vue.js',
    output: {
      format: 'esm',
      file: 'example/dist/vue.js'
    },
    plugins: [nodeResolve(), svgSprites()]
  },
  {
    input: './example/src/react.js',
    output: {
      format: 'esm',
      file: 'example/dist/react.js'
    },
    plugins: [nodeResolve(), svgSprites()]
  }
]
