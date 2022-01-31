import { resolve } from 'path'
import { promises as fs } from 'fs'
import md5 from 'md5'
import symbolFactory from 'svg-baker/lib/symbol-factory'
import { compileJSXCode, compileVueTemplateCode } from './compiler'
import { FilterPattern, createFilter } from '@rollup/pluginutils'

const symbolOptionsCaches: {
  id: string
  content: string
  viewBox: string
}[] = []

type Options = {
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

export default function svgSprites(options: Options = {}) {
  const svgRegex = /\.svg(\?(jsx|vueComponent))?$/
  const externalRegex = /^(vue|react)/
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'rollup-plugin-svg-sprites',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string) {
      if (source == 'svg-sprites-virtual-module') {
        return source
      }
      // if (source.match(svgRegex)) {
      //   return source
      // }
      // if (importer && importer.match(svgRegex) && source.match(externalRegex)) {
      //   // external
      //   return false
      // }
      return null
    },
    async load(id: string) {
      if (id === 'svg-sprites-virtual-module') {
        const data = await fs.readFile(
          resolve(__dirname, './browser-import.js'),
          {
            encoding: 'utf-8'
          }
        )
        return data
      }

      if (!filter(id) || !id.match(svgRegex)) {
        return null
      }

      const [path, query] = id.split('?', 2)

      const data = await fs.readFile(path, {
        encoding: 'utf-8'
      })

      let symbolOptions = symbolOptionsCaches.find(
        options => options.content === data
      )
      if (!symbolOptions) {
        let useId
        if (typeof options.symbolId === 'function') {
          useId = options.symbolId(path, query)
        } else {
          useId = md5(data)
        }

        const processingResult = await symbolFactory({
          id: useId,
          content: data
        })
        const attrs = processingResult.tree[0].attrs

        symbolOptions = {
          id: attrs.id,
          content: processingResult.toString(),
          viewBox: attrs.viewBox
        }

        symbolOptionsCaches.push(symbolOptions)
      }

      const renders = [
        `
import { sprite, SpriteSymbol } from "svg-sprites-virtual-module"

const symbol = new SpriteSymbol(${JSON.stringify(symbolOptions)})
sprite.add(symbol)`
      ]

      let code: string

      if (query === 'jsx' || options.jsx) {
        code = compileJSXCode(symbolOptions.id, path)
      } else if (query === 'vueComponent' || options.vueComponent) {
        code = await compileVueTemplateCode(symbolOptions.id, path)
      } else {
        code = `
export default symbol`
      }

      renders.push(code)

      return renders.join(`
      `)
    }
  }
}
