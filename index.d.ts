import { Plugin } from 'rollup'
import { FilterPattern } from '@rollup/pluginutils'

declare module '*.svg?vueComponent' {
  import { Component } from 'vue'
  const component: Component
  export default component
}

declare module '*.svg?jsx' {
  import { ReactElement } from 'react'
  const component: ReactElement<any, any>
  export default component
}

interface SvgSpritesOptions {
  /**
   * How <symbol> id attribute should be named.
   * @default md5(svgContent)
   */
  symbolId?: (path: string, query?: string) => string
  /**
   * You can specifically include files
   * @default undefined
   */
  include?: FilterPattern
  /**
   * You can specifically exclude files.
   * @default undefined
   */
  exclude?: FilterPattern
  /**
   * If true, when import "*.svg" will return a Vue3.x Component. Priority level is weaker than import "*.svg?vueComponent".
   * @default false
   */
  vueComponent?: boolean
  /**
   * If true, when import "*.svg" will return a JSX Function. Priority level is weaker than import "*.svg?jsx".
   * @default false
   */
  jsx?: boolean
}

export default function svgSprites(options?: SvgSpritesOptions): Plugin
