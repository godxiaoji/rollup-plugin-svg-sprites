const { resolve, extname } = require('path')
const { readFileSync } = require('fs')
const nanoid = require('nanoid')
const symbolFactory = require('svg-baker/lib/symbol-factory')

const symbolOptionsCaches = []

module.exports = function svgSpriteLoader(options = {}) {
  return {
    name: 'rollup-plugin-svg-sprites',
    resolveId(importee, importer) {
      if (importee == 'svg-sprites-virtual-module') {
        return importee
      }
      // if (importer == 'svg-sprites-virtual-module') {
      //   return {
      //     id: resolve(__dirname, '../', importee),
      //     external: false
      //   }
      // }
      return null
    },
    async load(id) {
      if (id === 'svg-sprites-virtual-module') {
        const data = readFileSync(
          resolve(__dirname, './browser-import.js'),
          'UTF-8'
        )
        return data
      }

      if (extname(id) !== '.svg') return null

      const data = readFileSync(id, 'UTF-8')

      let symbolOptions = symbolOptionsCaches.find(svg => svg.content === data)
      if (!symbolOptions) {
        // 处理下命名规则
        let useId
        if (typeof options.symbolId === 'function') {
          useId = options.symbolId(id)
        } else {
          useId = nanoid()
        }

        const processingResult = await new symbolFactory({
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

      return [
        'import {sprite, SpriteSymbol} from "svg-sprites-virtual-module";',
        `var symbol = new SpriteSymbol(${JSON.stringify(symbolOptions)});`,
        'sprite.add(symbol);',
        'export default symbol;'
      ].join('\n')
    }
  }
}
