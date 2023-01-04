import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { create, use } from 'xoid';
import { games$ } from './game-shelf';
import { storage$ } from './storage';
import {
  basePath$,
  clearAdditionalResources,
  clearResources,
  fillLocalFS,
  getResource,
  getTextContent,
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
import TOMLparse from '@iarna/toml/parse-string';
import { fetchProxyFallback } from '@qspider/utils';

export const currentGame$ = create<GameDescriptor | null>();
export const currentGameMode$ = create((get) => get(currentGame$)?.mode || 'classic');
export const currentAeroWidth$ = currentGame$.focus((state) => state?.aero?.width ?? 800);
export const currentAeroHeight$ = currentGame$.focus((state) => state?.aero?.height ?? 600);

export async function runGame(id: string): Promise<void> {
  let descriptor = games$.value?.[id];
  if (!descriptor) throw new Error('Game not found');
  const { file } = descriptor;
  const source = await storage$.value?.getGameSource(id);
  if (source) {
    await fillLocalFS(source, file);
  } else {
    const source = await fetchProxyFallback(file).then((r) => {
      if (!r.ok) throw new Error('game file not found');
      return r.arrayBuffer();
    });
    if (isZip(source.slice(0, 4))) {
      await fillLocalFS(source, file);
    } else {
      const isQsps = file.toLowerCase().endsWith('.qsps');
      if (isQsps) {
        const gameSource = convertQsps(source);
        mainFileSource$.set(new Uint8Array(gameSource));
      } else mainFileSource$.set(new Uint8Array(source));
      basePath$.set(file.slice(0, file.lastIndexOf('/') + 1));
    }
  }

  try {
    const configContent = await getTextContent('game.cfg');
    const config = TOMLparse(configContent) as unknown as PlayerConfig;
    if (config.game?.length === 1) {
      [descriptor] = config.game;
    } else {
      const found = config.game?.find((game) => game.id === id);
      if (!found) throw new Error('Config not found');
      descriptor = found;
    }
  } catch {
    // no-op
  }

  if (descriptor.mode === 'aero' && !descriptor.aero) {
    try {
      const content = await getTextContent('config.xml');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const gameElement = doc.querySelector('game');
      if (gameElement) {
        const width = parseInt(gameElement.getAttribute('width') || '800');
        const height = parseInt(gameElement.getAttribute('height') || '600');
        descriptor.aero = {
          width,
          height,
        };
      }
    } catch {
      // no-op
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
  if (descriptor.window?.fullscreen) {
    setTimeout(() => windowManager$.value?.goFullscreen(), 0);
  }
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
