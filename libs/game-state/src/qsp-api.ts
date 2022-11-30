import { initQspEngine, QspAPI, QspErrorData } from '@qsp/wasm-engine';
import { create } from 'xoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from '@qsp/wasm-engine/qsp-engine.wasm';

export const qspApi$ = create<QspAPI>();
export const qspApiInitialized$ = create(false);
export const platform$ = create('browser');
export const qspError$ = create<QspErrorData | null>(null);

export async function initQspApi(): Promise<void> {
  const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
  const api = await initQspEngine(wasm);
  console.log(`QSP version: ${api.version()}`);
  qspApi$.set(api);
  qspApiInitialized$.set(true);
}

qspApi$.subscribe((api) => {
  api.on('version', (type, callback) => {
    switch (type) {
      case 'player':
        return callback('qSpider');
      case 'platform':
        return callback(platform$.value);
    }
    return callback(api.version());
  });
  api.on('error', qspError$.set);
});
