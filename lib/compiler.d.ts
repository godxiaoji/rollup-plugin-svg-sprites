declare const compileJSXCode: (id: string, path: string) => string;
declare const compileVueTemplateCode: (id: string, path: string) => Promise<string>;
export { compileJSXCode, compileVueTemplateCode };
