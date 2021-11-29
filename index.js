const { resolve } = require('path')
const fs = require('fs').promises
const md5 = require('md5')
const symbolFactory = require('svg-baker/lib/symbol-factory')
const { createFilter } = require('@rollup/pluginutils')
const { compileTemplate } = require('@vue/compiler-sfc')

const symbolOptionsCaches = []

module.exports = function svgSprites(options = {}) {
  const svgRegex = /\.svg(\?(vueComponent))?$/
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'rollup-plugin-svg-sprites',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source == 'svg-sprites-virtual-module') {
        return source
      }
      // if (source.match(svgRegex)) {
      //   return source
      // }
      return null
    },
    async load(id) {
      if (id === 'svg-sprites-virtual-module') {
        const data = await fs.readFile(
          resolve(__dirname, './browser-import.js'),
          'UTF-8'
        )
        return data
      }

      if (!filter(id) || !id.match(svgRegex)) {
        return null
      }

      const [path, query] = id.split('?', 2)

      const data = await fs.readFile(path, 'UTF-8')

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

      const renders = [
        'import {sprite, SpriteSymbol} from "svg-sprites-virtual-module"',
        `const symbol = new SpriteSymbol(${JSON.stringify(symbolOptions)})`,
        'sprite.add(symbol)'
      ]

      if (query === 'vueComponent' || options.vueComponent) {
        const { code } = compileTemplate({
          id: JSON.stringify(symbolOptions.id),
          source: `<svg><use xlink:href="#${symbolOptions.id}"></use></svg>`,
          filename: path,
          transformAssetUrls: false
        })

        renders.push(code)
        renders.push('export default { render: render }')
      } else {
        renders.push('export default symbol')
      }

      return renders.join(`\n`)
    }
  }
}

module.exports.default = module.exports
