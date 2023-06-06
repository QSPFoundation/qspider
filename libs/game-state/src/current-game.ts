import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { create } from 'xoid';
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
import {
  AERO_THEME,
  CLASSIC_THEME,
  currentTheme$,
  currentTranslations$,
  registerThemes,
  themeRegistry$,
} from './themes';
import { isPaused$ } from './counter';
import { muted$, sounds$ } from './audio';
import { isPauseScreenVisible$, pauseScreenCurrentPanel$ } from './pause-screen';
import { loadSaveList } from './save';
import { clearHotkeys, setupCustomHotKeys, setupGlobalHotKeys } from './hotkeys';
import { windowManager$ } from './window-manager';
import { parse } from 'iarna-toml-esm';
import { fetchProxyFallback } from '@qspider/utils';
import { parseCfg, qspGuiCfg$ } from './qsp-gui-cfg';
import { loadThemeTranslations, unloadThemeTranslations } from '@qspider/i18n';
import { layers$, regions$ } from './panels';

export const currentGameEntry = create<GameShelfEntry | null>(null);
export const currentGame$ = create<GameDescriptor | null>();
export const currentGameMode$ = create((get) => get(currentGame$)?.mode || 'classic');
export const currentAeroWidth$ = create((get) => get(currentGame$)?.aero?.width ?? 800);
export const currentAeroHeight$ = create((get) => get(currentGame$)?.aero?.height ?? 600);
export const saveSlotsCount$ = create((get) => get(currentGame$)?.save_slots ?? 9);
export const onGameEnd$ = create<null | (() => void)>(null);

export async function runGame(descriptor: GameShelfEntry): Promise<void> {
  if (!descriptor) throw new Error('Game not found');
  const { file } = descriptor;
  const source = await storage$.value?.getGameSource(descriptor.id);
  if (source) {
    await fillLocalFS(source, file);
  } else {
    const source = await fetchProxyFallback(file).then((r) => {
      if (!r.ok) throw new Error('Game file not found');
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
    const config = parse(configContent) as unknown as PlayerConfig;
    if (config.game?.length === 1) {
      [descriptor] = config.game;
    } else {
      const found = config.game?.find((game) => game.id === descriptor.id);
      if (!found) throw new Error('Config not found');
      descriptor = found;
    }
  } catch {
    // no-op
  }

  if (descriptor.mode === 'classic' || !descriptor.mode) {
    try {
      const cfgContent = await getTextContent('qspgui.cfg');
      const cfgData = parseCfg(cfgContent);
      qspGuiCfg$.set(cfgData);
    } catch {
      // no-op
    }
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
  }
  loadAdditionalResources(descriptor.resources);
  if (descriptor.themes) {
    await registerThemes(descriptor.themes);
  }
  if (descriptor.defaultTheme) {
    currentTheme$.set(descriptor.defaultTheme);
  } else if (descriptor.mode === 'aero') {
    currentTheme$.set(AERO_THEME);
  } else {
    currentTheme$.set(CLASSIC_THEME);
  }
  loadThemeTranslations(currentTranslations$.value);
  qspApi$.value?.openGame(gameSource, true);
  qspApi$.value?.restartGame();
  currentGame$.set(descriptor);
  loadSaveList();
  applyWindowSettings(descriptor.window);
}

let wasResized = false;
function applyWindowSettings(window: GameDescriptor['window']): void {
  if (window) {
    if (window.minWidth && window.minHeight) {
      windowManager$.value?.setMinSize(window.minWidth, window.minHeight);
    }
    if (window.maxWidth && window.maxHeight) {
      windowManager$.value?.setMaxSize(window.maxWidth, window.maxHeight);
    }
    const resizable = window.resizable ?? true;
    windowManager$.value?.setResizable(resizable);
    if (window.width && window.height) {
      windowManager$.value?.resize(window.width, window.height);
      wasResized = true;
    }
    if (window.fullscreen) {
      setTimeout(() => windowManager$.value?.goFullscreen(), 0);
    }
  }
}

export function stopCurrentGame(): void {
  currentGame$.set(null);
  qspGuiCfg$.set(null);
  isPauseScreenVisible$.set(false);
  const windowManager = windowManager$.value;
  if (windowManager) {
    windowManager.setTitle('qSpider');
    windowManager.setIcon('assets/favicon.png');
    windowManager.setResizable(true);
    windowManager.unsetMaxSize();
    windowManager.unsetMinSize();
    if (wasResized) windowManager.resize(1024, 768);
  }
  sounds$.actions.clear();
  regions$.set({});
  layers$.set({});
  clearResources();
  clearAdditionalResources();
  clearHotkeys();
  unloadThemeTranslations();
  currentTheme$.set(CLASSIC_THEME);
  themeRegistry$.actions.reset();
  window.dispatchEvent(new Event('game-unload'));
  wasResized = false;
  onGameEnd$.value?.();
}
export type GameAction = 'quicksave' | 'quickload' | 'restart' | 'resume' | 'quit' | 'mute' | 'unmute' | 'toggle-mute';

export function onGameAction(action: GameAction): void {
  if (action.startsWith('pause:')) {
    const [, panel] = action.split(':');
    if (!isPauseScreenVisible$.value) isPauseScreenVisible$.set(true);
    pauseScreenCurrentPanel$.set(panel);
  }
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
