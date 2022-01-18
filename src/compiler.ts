import { compileTemplate } from '@vue/compiler-sfc'

function compileJSXCode(id: string, path: string) {
  return (
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

function compileVueTemplateCode(id: string, path: string) {
  const { code } = compileTemplate({
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
