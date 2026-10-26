import { currentGameEntry$, GameCommand, onGameCommand, stopCurrentGame } from './current-game';
import { layers$, readLayerState, readRegion, regions$, regionsScroll$, reloadLayers } from './panels';
import { currentTheme$, themeRegistry$ } from './themes';
import { showError } from './toasts';
import { windowManager } from '@qspider/env';
import { parseEvent, parseScrollRegion, scrollStep } from './qspider-command-parsers';

export const qspiderCommands: Record<string, (input: string) => void> = {
  'action:'(action: string): void {
    if (action === 'restart') {
      // A restart from game code runs on the next tick, after the engine call that requested it has
      // returned: restarting inside it lets the new game's async library load re-enter the engine mid-call,
      // and the restart is lost. Code after `gs 'qspider_restart'` in the same action still runs first;
      // the restart then discards its effects. Skipped when the game was stopped meanwhile (a restart then
      // a quit in the same action), so a stale engine is not restarted onto the shelf.
      setTimeout(() => {
        if (currentGameEntry$.value) onGameCommand('restart');
      }, 0);
      return;
    }
    onGameCommand(action as GameCommand);
  },
  'event:'(event: string): void {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('qspider-event', { detail: parseEvent(event) }));
    }, 0);
  },
  'change_theme:'(name: string): void {
    const themes = themeRegistry$.value;
    const existingTheme = themes[name];
    if (!existingTheme) {
      showError(`Theme ${name} is not registered`);
      return;
    }
    currentTheme$.set(name);
  },
  'update_region:'(name: string): void {
    regions$.focus((s) => s[name]).set(readRegion(name));
  },
  'scroll_region:'(data: string): void {
    const { name, direction } = parseScrollRegion(data);
    regionsScroll$.focus((s) => s[name]).update((x) => scrollStep(x, direction));
  },
  'update_layer:'(name: string): void {
    const layer$ = layers$.focus((s) => s[name]);
    layer$.set(readLayerState(name));
  },
  update_layers(): void {
    reloadLayers();
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
