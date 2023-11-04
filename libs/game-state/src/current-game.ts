import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { create } from 'xoid';
import { clearAdditionalResources, loadAdditionalResources } from './resources';
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
import { loadSaveList, quickLoad, quickSave } from './save';
import { clearHotkeys, setupCustomHotKeys, setupGlobalHotKeys } from './hotkeys';
import { windowManager$ } from './window-manager';
import { parse } from 'iarna-toml-esm';
import { fetchProxyFallback } from '@qspider/utils';
import { parseCfg, qspGuiCfg$ } from './qsp-gui-cfg';
import { loadThemeTranslations, unloadThemeTranslations } from '@qspider/i18n';
import {
  actions$,
  cmdText$,
  layers$,
  mainContent$,
  mainScroll$,
  objects$,
  regions$,
  reloadLayers,
  reloadRegions,
  statsContent$,
  statsScroll$,
} from './panels';
import { convertQsps } from './utils';
import { initialBaseUrl$ } from './init';
import { input$ } from './input';
import { menu$ } from './menu';
import { msg$ } from './msg';

export const currentGameEntry$ = create<GameShelfEntry | null>(null);
export const currentGame$ = create<GameDescriptor | null>();
export const currentGameMode$ = create((get) => get(currentGame$)?.mode || 'classic');
export const currentAeroWidth$ = create((get) => get(currentGame$)?.aero?.width ?? 800);
export const currentAeroHeight$ = create((get) => get(currentGame$)?.aero?.height ?? 600);
export const saveSlotsCount$ = create((get) => get(currentGame$)?.save_slots ?? 9);
export const onGameEnd$ = create<null | (() => void)>(null);
export const baseUrl$ = create('');

export async function runGame(entry: GameShelfEntry): Promise<void> {
  if (!entry) throw new Error('Game not found');
  baseUrl$.set(entry.loadConfig.url);

  let descriptor: GameDescriptor = entry.loadConfig.descriptor || {
    id: entry.id,
    mode: entry.mode,
    title: entry.title,
    file: '',
  };
  try {
    const configContent = await fetchProxyFallback('game.cfg').then((r) => r.text());
    const config = parse(configContent) as unknown as PlayerConfig;
    if (config.game?.length === 1) {
      [descriptor] = config.game;
    } else {
      const found = config.game?.find((game) => game.id === entry.id);
      if (!found) throw new Error('Config not found');
      descriptor = found;
    }
  } catch {
    // no-op
  }

  if (descriptor?.mode === 'classic' || !descriptor?.mode) {
    try {
      const request = await fetchProxyFallback('qspgui.cfg');
      if (!request.ok) throw new Error('No config file');
      const cfgContent = await request.text();
      const cfgData = parseCfg(cfgContent);
      qspGuiCfg$.set(cfgData);
    } catch {
      // no-op
    }
  }

  if (descriptor && descriptor.mode === 'aero' && !descriptor.aero) {
    try {
      const request = await fetchProxyFallback('config.xml');
      console.log(request);
      if (!request.ok) throw new Error('No config file');
      const content = await request.text();
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
        descriptor.window = {
          ...descriptor.window,
          width,
          maxWidth: width,
          minWidth: width,
          height,
          minHeight: height,
          maxHeight: height,
          resizable: false,
        };
      }
    } catch {
      descriptor.aero = {
        width: 800,
        height: 600,
      };
      descriptor.window = {
        ...descriptor.window,
        width: 800,
        maxWidth: 800,
        minWidth: 800,
        height: 600,
        minHeight: 600,
        maxHeight: 600,
        resizable: false,
      };
    }
  }
  console.log(descriptor);

  let gameSource = await fetchProxyFallback(entry.loadConfig.entrypoint).then((r) => r.arrayBuffer());
  if (!gameSource) throw new Error('Failed to load game');
  const isQsps = entry.loadConfig.entrypoint.toLowerCase().endsWith('.qsps');
  if (isQsps) {
    gameSource = convertQsps(gameSource);
  }
  windowManager$.value?.setTitle(entry.title);
  setupGlobalHotKeys();
  if (descriptor?.hotkeys) {
    setupCustomHotKeys(descriptor.hotkeys);
  }
  if (descriptor?.resources?.icon) {
    windowManager$.value?.setIcon(descriptor.resources.icon);
  }
  loadAdditionalResources(descriptor?.resources);
  if (descriptor?.themes) {
    await registerThemes(descriptor.themes);
  }
  if (descriptor?.defaultTheme) {
    currentTheme$.set(descriptor.defaultTheme);
  } else if (descriptor?.mode === 'aero') {
    currentTheme$.set(AERO_THEME);
  } else {
    currentTheme$.set(CLASSIC_THEME);
  }
  loadThemeTranslations(currentTranslations$.value);
  qspApi$.value?.openGame(gameSource, true);
  qspApi$.value?.restartGame();
  currentGameEntry$.set(entry);
  descriptor && currentGame$.set(descriptor);
  loadSaveList();
  console.log(descriptor);
  descriptor && applyWindowSettings(descriptor.window);
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

baseUrl$.subscribe((url) => {
  const baseTag = document.querySelector<HTMLBaseElement>('#page-base') as HTMLBaseElement;
  baseTag.href = url || '/';
});

export function stopCurrentGame(): void {
  baseUrl$.set(initialBaseUrl$.value);
  currentGameEntry$.set(null);
  currentGame$.set(null);
  qspGuiCfg$.set(null);
  isPauseScreenVisible$.set(false);
  isPaused$.set(true);

  // clear state
  input$.set(null);
  menu$.set(null);
  msg$.set(null);
  mainContent$.set('');
  statsContent$.set('');
  actions$.set([]);
  objects$.set([]);
  cmdText$.set('');

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

function onRestart(): void {
  reloadRegions();
  reloadLayers();
}
export function onRestore(): void {
  reloadRegions();
  reloadLayers();
}

export function onGameAction(action: GameAction): void {
  if (action.startsWith('pause:')) {
    const [, panel] = action.split(':');
    if (!isPauseScreenVisible$.value) isPauseScreenVisible$.set(true);
    pauseScreenCurrentPanel$.set(panel);
  } else if (action.startsWith('scroll:')) {
    const [, panel, direction] = action.split(':');
    switch (panel) {
      case 'main':
        mainScroll$.update((x) => (direction === 'top' ? -1 : Math.max(x, 0) + 1));
        break;
      case 'stats':
        statsScroll$.update((x) => (direction === 'top' ? -1 : Math.max(x, 0) + 1));
        break;
    }
  }
  switch (action) {
    case 'quit':
      stopCurrentGame();
      break;
    case 'restart':
      isPaused$.set(true);
      qspApi$.value?.restartGame();
      onRestart();
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
    case 'quicksave':
      quickSave();
      break;
    case 'quickload':
      quickLoad();
      break;
  }
}
