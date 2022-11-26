import { initQspEngine, QspAPI } from '@qsp/wasm-engine';
import { create } from 'xoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from '@qsp/wasm-engine/qsp-engine.wasm';

export const qspApi$ = create<QspAPI>();
export const qspApiInitialized = create(false);

export async function initQspApi(): Promise<void> {
  const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
  const api = await initQspEngine(wasm);
  console.log(`QSP version: ${api.version()}`);
  qspApi$.set(api);
  qspApiInitialized.set(true);
}
