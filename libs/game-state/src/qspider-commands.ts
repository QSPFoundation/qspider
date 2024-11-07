import { GameCommand, onGameCommand, stopCurrentGame } from './current-game';
import { layers$, readLayerState, regions$, regionsScroll$ } from './panels';
import { qspApi$ } from './qsp-api';
import { currentTheme$, themeRegistry$ } from './themes';
import { errorMessage$ } from './toasts';
import { windowManager } from '@qspider/env';

function parseArgs(input: string): Array<string | number> {
  const args: Array<string | number> = [];
  let is_string = false;
  let current: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '~') {
      if (is_string) {
        is_string = false;
        args.push(current.join(''));
        current = [];
      } else {
        is_string = true;
      }
    } else if (!is_string && char === ',') {
      args.push(parseFloat(current.join('')));
      current = [];
    } else {
      current.push(char);
    }
  }
  if (current.length) {
    args.push(parseFloat(current.join('')));
  }
  return args;
}

export const qspiderCommands: Record<string, (input: string) => void> = {
  'action:'(action: string): void {
    onGameCommand(action as GameCommand);
  },
  'event:'(event: string): void {
    setTimeout(() => {
      const match = event.trim().match(/(.*?)(\[(.*?)\])/i);
      if (match) {
        const name = match[1];
        const args = parseArgs(match[3]);
        window.dispatchEvent(
          new CustomEvent('qspider-event', {
            detail: { name, args },
          }),
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('qspider-event', {
            detail: { name: event.trim() },
          }),
        );
      }
    }, 0);
  },
  'change_theme:'(name: string): void {
    const themes = themeRegistry$.value;
    const existingTheme = themes[name];
    if (!existingTheme) {
      errorMessage$.set(`Theme ${name} is not registered`);
      return;
    }
    currentTheme$.set(name);
  },
  'update_region:'(name: string): void {
    const region$ = regions$.focus((s) => s[name]);
    region$.set(qspApi$.value?.readVariableByKey('$qspider_region', name) ?? '');
  },
  'scroll_region:'(data: string): void {
    const [name, direction] = data.split(':');
    const scroll$ = regionsScroll$.focus((s) => s[name]);
    if (direction === 'top') {
      scroll$.set(-1);
    } else {
      scroll$.update((x = 0) => Math.max(x, 0) + 1);
    }
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
      windowManager.goFullscreen();
    } else {
      windowManager.goWindowed();
    }
  },
  quit(): void {
    stopCurrentGame();
  },
};
