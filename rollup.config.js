import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

export default [
  {
    input: './src/browser-import.js',
    output: [
      {
        banner: '/* eslint-disable */',
        format: 'esm',
        file: 'lib/browser-import.js'
      },
      {
        banner: '/* eslint-disable */',
        format: 'esm',
        file: 'example/browser-import.js'
      }
    ],
    plugins: [nodeResolve(), commonjs()]
  },
  {
    input: './src/index.ts',
    output: [
      {
        format: 'cjs',
        file: 'lib/index.js',
        exports: 'default'
      },
      {
        format: 'esm',
        file: 'lib/index.mjs',
        exports: 'default'
      }
    ],
    external: [
      'svg-baker/lib/symbol-factory',
      '@rollup/pluginutils',
      'md5',
      '@vue/compiler-sfc',
      'path',
      'fs'
    ],
    plugins: [typescript()]
  }
]
