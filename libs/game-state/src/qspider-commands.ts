import { stopCurrentGame } from './current-game';
import { layers$, readLayerState, regions$ } from './panels';
import { qspApi$ } from './qsp-api';
import { windowManager$ } from './window-manager';

export const qspiderCommands: Record<string, (input: string) => void> = {
  'event:'(event: string): void {
    const match = event.trim().match(/(.*?)(\[(.*?)\])/i);
    if (match) {
      const name = match[1];
      const args = match[3].split(',').map((arg) => {
        const prepared = arg.trim();
        if (prepared.startsWith('"') || prepared.startsWith("'")) {
          return prepared.replace(/['"](.*?)['"]/gim, (_, path) => path);
        }
        return parseInt(prepared);
      });
      window.dispatchEvent(
        new CustomEvent('qspider-event', {
          detail: { name, args },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('qspider-event', {
          detail: { name: event.trim() },
        })
      );
    }
  },
  'update_region:'(name: string): void {
    const region$ = regions$.focus((s) => s[name]);
    region$.set(qspApi$.value?.readVariableByKey('$qspider_region', name) ?? '');
  },
  'update_layer:'(name: string): void {
    const layer$ = layers$.focus((s) => s[name]);
    layer$.set(readLayerState(name));
  },
  update_layers(): void {
    const layers = layers$.value ?? {};
    const updated: Record<string, boolean> = {};
    for (const name of Object.keys(layers)) {
      updated[name] = readLayerState(name);
    }
    layers$.set(updated);
  },
  'fullscreen:'(state: string): void {
    if (state === 'on') {
      windowManager$.value?.goFullscreen();
    } else {
      windowManager$.value?.goWindowed();
    }
  },
  quit(): void {
    stopCurrentGame();
  },
};
