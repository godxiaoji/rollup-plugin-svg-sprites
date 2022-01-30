let vueCompiler: any
const getVueCompiler = async () => {
  if (vueCompiler) return vueCompiler
  vueCompiler = await import('@vue/compiler-sfc')
  return vueCompiler
}

const compileJSXCode = (id: string, path: string) => {
  return (
    `
    ` +
    (process.env.NODE_ENV === 'production'
      ? `
import { jsxs as _jsxs } from 'react/jsx-runtime'
`
      : `
import jsxDevRuntime from 'react/jsx-dev-runtime'
const _jsxs = function jsxWithValidationStatic(type, props, key) {
  return jsxDevRuntime.jsxDEV(type, props, key, true)
}
`) +
    `
function SVGComponent() {
  return _jsxs('svg', {
    children: [_jsxs('use', {
      xlinkHref: '#${id}'
    })]
  })
}

export default SVGComponent
`
  )
}

const compileVueTemplateCode = async (id: string, path: string) => {
  const compiler = await getVueCompiler()

  const { code } = compiler.compileTemplate({
    id: JSON.stringify(id),
    source: `<svg><use xlink:href="#${id}"></use></svg>`,
    filename: path,
    transformAssetUrls: false
  })

  return `
${code}

export default { render: render }
`
}

export { compileJSXCode, compileVueTemplateCode }
