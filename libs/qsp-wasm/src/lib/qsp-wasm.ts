import qsp from '../qsplib/public/qsp-wasm';
import qspModule from '../qsplib/public/qsp-wasm.wasm';

import { QspAPI } from './contracts';
import { QspAPIImpl } from './qsp-api';

// Since webpack will change the name and potentially the path of the
// `.wasm` file, we have to provide a `locateFile()` hook to redirect
// to the appropriate URL.
// More details: https://kripken.github.io/emscripten-site/docs/api_reference/module.html
const moduleWasmPromise = qsp({
  locateFile(path: string) {
    if (path.endsWith('.wasm')) {
      return qspModule;
    }
    return path;
  },
});

export function init(): Promise<QspAPI> {
  return new Promise((resolve) => {
    moduleWasmPromise.then((moduleWasm) => {
      resolve(new QspAPIImpl(moduleWasm));
    });
  });
}
