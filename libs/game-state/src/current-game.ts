import { GameDescriptor } from '@qspider/contracts';
import { create, use } from 'xoid';
import { games$ } from './game-shelf';
import { storage$ } from './storage';
import {
  basePath$,
  clearAdditionalResources,
  clearResources,
  fillLocalFS,
  getResource,
  loadAdditionalResources,
  mainFileSource$,
} from './resources';
import { convertQsps, isZip } from './utils';
import { qspApi$ } from './qsp-api';
import { CLASSIC_THEME, currentTheme$, registerThemes, themeRegistry$ } from './themes';
import { isPaused$ } from './counter';
import { muted$, sounds$ } from './audio';
import { isPauseScreenVisible$, pauseScreenTab$ } from './pause-screen';
import { loadSaveList } from './save';
import { clearHotkeys, setupCustomHotKeys, setupGlobalHotKeys } from './hotkeys';
import { windowManager$ } from './window-manager';

export const currentGame$ = create<GameDescriptor | null>();
export const currentGameMode$ = create((get) => get(currentGame$)?.mode || 'classic');
export const currentAeroWidth$ = currentGame$.focus((state) => state?.aero?.width ?? 800);
export const currentAeroHeight$ = currentGame$.focus((state) => state?.aero?.height ?? 600);

export async function runGame(id: string): Promise<void> {
  const descriptor = games$.value?.[id];
  if (!descriptor) throw new Error('Game not found');
  const { file } = descriptor;
  const source = await storage$.value?.getGameSource(id);
  if (source) {
    fillLocalFS(source, file);
  } else {
    const source = await fetch(file).then((r) => r.arrayBuffer());
    if (isZip(source.slice(0, 4))) {
      fillLocalFS(source, file);
    } else {
      const isQsps = file.toLowerCase().endsWith('.qsps');
      if (isQsps) {
        const gameSource = convertQsps(source);
        mainFileSource$.set(new Uint8Array(gameSource));
      } else mainFileSource$.set(new Uint8Array(source));
      basePath$.set(file.slice(0, file.lastIndexOf('/') + 1));
    }
  }

  const gameSource = mainFileSource$.value;
  if (!gameSource) throw new Error('Failed to load game');
  windowManager$.value?.setTitle(descriptor.title);
  setupGlobalHotKeys();
  if (descriptor.hotkeys) {
    setupCustomHotKeys(descriptor.hotkeys);
  }
  if (descriptor.resources?.icon) {
    windowManager$.value?.setIcon(getResource(descriptor.resources?.icon).url);
  } else {
    windowManager$.value?.setIcon('assets/favicon.png');
  }
  loadAdditionalResources(descriptor.resources);
  if (descriptor.themes) {
    await registerThemes(descriptor.themes);
  }
  if (descriptor.defaultTheme) {
    currentTheme$.set(descriptor.defaultTheme);
  } else {
    currentTheme$.set(CLASSIC_THEME);
  }
  currentGame$.set(descriptor);
  qspApi$.value?.openGame(gameSource, true);
  qspApi$.value?.restartGame();
  loadSaveList();
}

export function stopCurrentGame(): void {
  currentGame$.set(null);
  windowManager$.value?.setTitle('qSpider');
  windowManager$.value?.setIcon('assets/favicon.png');
  use(sounds$).clear();
  clearResources();
  clearAdditionalResources();
  clearHotkeys();
  currentTheme$.set(CLASSIC_THEME);
  use(themeRegistry$).reset();
  window.dispatchEvent(new Event('game-unload'));
}
export type GameAction =
  | 'save'
  | 'load'
  | 'quicksave'
  | 'quickload'
  | 'restart'
  | 'resume'
  | 'quit'
  | 'preferences'
  | 'credits'
  | 'mute'
  | 'unmute'
  | 'toggle-mute';

export function onGameAction(action: GameAction): void {
  switch (action) {
    case 'quit':
      stopCurrentGame();
      break;
    case 'restart':
      isPaused$.set(true);
      qspApi$.value?.restartGame();
      isPauseScreenVisible$.set(false);
      break;
    case 'resume':
      isPauseScreenVisible$.set(false);
      break;
    case 'save':
    case 'load':
    case 'preferences':
    case 'credits':
      if (!isPauseScreenVisible$.value) isPauseScreenVisible$.set(true);
      pauseScreenTab$.set(action);
      break;
    case 'mute':
      muted$.set(true);
      break;
    case 'unmute':
      muted$.set(false);
      break;
    case 'toggle-mute':
      muted$.update((muted) => !muted);
      break;
  }
}
