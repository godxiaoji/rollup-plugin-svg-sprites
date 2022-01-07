declare module 'rollup-plugin-svg-sprites' {
  import { FilterPattern } from '@rollup/pluginutils'
  function svgSprites(options?: {
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
  }): {
    name: string
    enforce: 'pre'
    resolveId: (source: string, importer: string) => string | null
    load: (id: string) => Promise<string>
  }
  export default svgSprites
}

interface BrowserSpriteSymbol {
  content: string
  id: string
  node: Symbol
  viewBox: string
}

declare module '*.svg' {
  const src: BrowserSpriteSymbol
  export default src
}

declare module '*.svg?vueComponent' {
  import { Component } from 'vue'
  const src: Component
  export default src
}

declare module '*.svg?jsx' {
  import { ReactElement } from 'react'
  const src: ReactElement<any, any>
  export default src
}
