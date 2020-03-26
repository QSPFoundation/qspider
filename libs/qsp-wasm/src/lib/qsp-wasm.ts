import qsp from '../wasm/qsp';
import qspModule from '../wasm/qsp.wasm';

import { QspApi } from './contracts';

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

export function init(): Promise<QspApi> {
  return new Promise((resolve) => {
    module.onRuntimeInitialized = () => {
      const api: QspApi = {
        version(): string {
          return module.UTF32ToString(module._QSPGetVersion());
        },
      };

      resolve(api);
    };
  });
}
