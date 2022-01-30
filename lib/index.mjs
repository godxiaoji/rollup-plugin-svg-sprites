import { resolve } from 'path';
import { promises } from 'fs';
import md5 from 'md5';
import symbolFactory from 'svg-baker/lib/symbol-factory';
import { createFilter } from '@rollup/pluginutils';

let vueCompiler;
const getVueCompiler = async () => {
    if (vueCompiler)
        return vueCompiler;
    vueCompiler = await import('@vue/compiler-sfc');
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
function SVGComponent() {
  return _jsxs('svg', {
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
    const externalRegex = /^(vue|react)/;
    const filter = createFilter(options.include, options.exclude);
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
            if (importer && importer.match(svgRegex) && source.match(externalRegex)) {
                // external
                return false;
            }
            return null;
        },
        async load(id) {
            if (id === 'svg-sprites-virtual-module') {
                const data = await promises.readFile(resolve(__dirname, './browser-import.js'), {
                    encoding: 'utf-8'
                });
                return data;
            }
            if (!filter(id) || !id.match(svgRegex)) {
                return null;
            }
            const [path, query] = id.split('?', 2);
            const data = await promises.readFile(path, {
                encoding: 'utf-8'
            });
            let symbolOptions = symbolOptionsCaches.find(options => options.content === data);
            if (!symbolOptions) {
                let useId;
                if (typeof options.symbolId === 'function') {
                    useId = options.symbolId(path, query);
                }
                else {
                    useId = md5(data);
                }
                const processingResult = await symbolFactory({
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
                code = await compileVueTemplateCode(symbolOptions.id, path);
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

export { svgSprites as default };
