/* eslint-disable */
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './src/browser-import.js',
  output: {
    format: 'esm',
    file: 'browser-import.js'
  },
  plugins: [nodeResolve(), commonjs()]
}
