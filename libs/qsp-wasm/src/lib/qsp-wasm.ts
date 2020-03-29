import qsp from '../wasm/qsp';
import qspModule from '../wasm/qsp.wasm';

import { QspAPI } from './contracts';
import { QspAPIImpl } from './qsp-api';

// Since webpack will change the name and potentially the path of the
// `.wasm` file, we have to provide a `locateFile()` hook to redirect
// to the appropriate URL.
// More details: https://kripken.github.io/emscripten-site/docs/api_reference/module.html
const module = qsp({
  locateFile(path) {
    if (path.endsWith('.wasm')) {
      return qspModule;
    }
    return path;
  },
});

export function init(): Promise<QspAPI> {
  return new Promise((resolve) => {
    module.onRuntimeInitialized = () => {
      resolve(new QspAPIImpl(module));
    };
  });
}
