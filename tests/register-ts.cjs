const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = function registerTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      isolatedModules: true,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
};
