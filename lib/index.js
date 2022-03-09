'use strict';

var path = require('path');
var fs = require('fs');
var md5 = require('md5');
var symbolFactory = require('svg-baker/lib/symbol-factory');
var pluginutils = require('@rollup/pluginutils');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var md5__default = /*#__PURE__*/_interopDefaultLegacy(md5);
var symbolFactory__default = /*#__PURE__*/_interopDefaultLegacy(symbolFactory);

let vueCompiler;
const getVueCompiler = async () => {
    if (vueCompiler)
        return vueCompiler;
    vueCompiler = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('@vue/compiler-sfc')); });
    return vueCompiler;
};
const compileJSXCode = (id, path) => {
    return (`
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
function SVGComponent(props) {
  return _jsxs('svg', {
    style: props.style,
    className: props.className,
    children: [_jsxs('use', {
      xlinkHref: '#${id}'
    })]
  })
}

export default SVGComponent
`);
};
const compileVueTemplateCode = async (id, path) => {
    const compiler = await getVueCompiler();
    const { code } = compiler.compileTemplate({
        id: JSON.stringify(id),
        source: `<svg><use xlink:href="#${id}"></use></svg>`,
        filename: path,
        transformAssetUrls: false
    });
    return `
${code}

export default { render: render }
`;
};

const symbolOptionsCaches = [];
function svgSprites(options = {}) {
    const svgRegex = /\.svg(\?(jsx|vueComponent))?$/;
    const filter = pluginutils.createFilter(options.include, options.exclude);
    return {
        name: 'rollup-plugin-svg-sprites',
        enforce: 'pre',
        resolveId(source, importer) {
            if (source == 'svg-sprites-virtual-module') {
                return source;
            }
            // if (source.match(svgRegex)) {
            //   return source
            // }
            // if (importer && importer.match(svgRegex) && source.match(externalRegex)) {
            //   // external
            //   return false
            // }
            return null;
        },
        async load(id) {
            if (id === 'svg-sprites-virtual-module') {
                const data = await fs.promises.readFile(path.resolve(__dirname, './browser-import.js'), {
                    encoding: 'utf-8'
                });
                return data;
            }
            if (!filter(id) || !id.match(svgRegex)) {
                return null;
            }
            const [path$1, query] = id.split('?', 2);
            const data = await fs.promises.readFile(path$1, {
                encoding: 'utf-8'
            });
            let symbolOptions = symbolOptionsCaches.find(options => options.content === data);
            if (!symbolOptions) {
                let useId;
                if (typeof options.symbolId === 'function') {
                    useId = options.symbolId(path$1, query);
                }
                else {
                    useId = md5__default["default"](data);
                }
                const processingResult = await symbolFactory__default["default"]({
                    id: useId,
                    content: data
                });
                const attrs = processingResult.tree[0].attrs;
                symbolOptions = {
                    id: attrs.id,
                    content: processingResult.toString(),
                    viewBox: attrs.viewBox
                };
                symbolOptionsCaches.push(symbolOptions);
            }
            const renders = [
                `
import { sprite, SpriteSymbol } from "svg-sprites-virtual-module"

const symbol = new SpriteSymbol(${JSON.stringify(symbolOptions)})
sprite.add(symbol)`
            ];
            let code;
            if (query === 'jsx' || options.jsx) {
                code = compileJSXCode(symbolOptions.id);
            }
            else if (query === 'vueComponent' || options.vueComponent) {
                code = await compileVueTemplateCode(symbolOptions.id, path$1);
            }
            else {
                code = `
export default symbol`;
            }
            renders.push(code);
            return renders.join(`
      `);
        }
    };
}

module.exports = svgSprites;
