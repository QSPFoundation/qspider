import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { atom } from 'xoid';
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
import {
  closePauseScreen,
  isPauseScreenVisible$,
  onClosePauseScreen,
  openPauseScreen,
  pauseScreenCurrentPanel$,
} from './pause-screen';
import { loadSaveList, quickLoad, quickSave } from './save';
import { clearHotkeys, setupCustomHotKeys, setupGlobalHotKeys } from './hotkeys';
import { fetchBinaryContent, fetchTextContent, windowManager } from '@qspider/env';
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
import { showNotice } from './toasts';
import { parseToml } from '@qspider/utils';
import { debugActions } from './debug';

export const currentGameEntry$ = atom<GameShelfEntry | null>(null);
export const currentGame$ = atom<GameDescriptor | null>();
export const currentGameMode$ = atom((get) => get(currentGame$)?.mode || 'classic');
export const currentAeroWidth$ = atom((get) => get(currentGame$)?.aero?.width ?? 800);
export const currentAeroHeight$ = atom((get) => get(currentGame$)?.aero?.height ?? 600);
export const saveSlotsCount$ = atom((get) => get(currentGame$)?.save_slots ?? 9);
export const onGameEnd$ = atom<null | (() => void)>(null);
export const baseUrl$ = atom('');

export async function runGame(entry: GameShelfEntry): Promise<void> {
  if (!entry) throw new Error('Game not found');
  try {
    baseUrl$.set(entry.loadConfig.url);

    let descriptor: GameDescriptor = entry.loadConfig.descriptor || {
      id: entry.id,
      mode: entry.mode,
      title: entry.title,
      file: '',
    };
    try {
      const configContent = await fetchTextContent(baseUrl$.value, 'game.cfg');
      const config = parseToml<PlayerConfig>(configContent);
      if (config.game?.length === 1) {
        [descriptor] = config.game;
      } else {
        const found = config.game?.find((game) => game.id === entry.id);
        if (!found) throw new Error('Config not found');
        descriptor = found;
      }
    } catch (e) {
      console.error('Game config not loaded', e);
    }

    if (descriptor?.mode === 'classic' || !descriptor?.mode) {
      try {
        const cfgContent = await fetchTextContent(baseUrl$.value, 'qspgui.cfg');
        const cfgData = parseCfg(cfgContent);
        if (!cfgData || !Object.keys(cfgData).length) throw new Error('Invalid config file');
        qspGuiCfg$.set(cfgData);
      } catch {
        // no-op
      }
    }

    if (descriptor.mode === 'aero') {
      if (descriptor.aero) {
        descriptor.window = {
          ...(descriptor.window ?? {}),
          ...descriptor.aero,
          resizable: false,
        };
      } else {
        try {
          const content = await fetchTextContent(baseUrl$.value, 'config.xml');
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
              ...(descriptor.window ?? {}),
              width,
              height,
              resizable: false,
            };
          }
        } catch {
          descriptor.aero = {
            width: 800,
            height: 600,
          };
          descriptor.window = {
            ...(descriptor.window ?? {}),
            width: 800,
            height: 600,
            resizable: false,
          };
        }
      }
    }

    windowManager.setTitle(entry.title);
    setupGlobalHotKeys();
    if (descriptor?.hotkeys) {
      setupCustomHotKeys(descriptor.hotkeys);
    }
    if (descriptor?.resources?.icon) {
      windowManager.setIcon(baseUrl$.value, descriptor.resources.icon);
    }
    loadAdditionalResources(descriptor?.resources);
    if (descriptor?.themes) {
      await registerThemes(descriptor.themes);
    }
    if (descriptor?.defaultTheme) {
      const theme = themeRegistry$.value[descriptor.defaultTheme];
      if (theme) {
        currentTheme$.set(descriptor.defaultTheme);
      } else {
        showNotice(`Theme ${descriptor.defaultTheme} not found`);
      }
    } else if (descriptor?.mode === 'aero') {
      currentTheme$.set(AERO_THEME);
    } else {
      currentTheme$.set(CLASSIC_THEME);
    }
    loadThemeTranslations(currentTranslations$.value);
    if (descriptor) applyWindowSettings(descriptor.window);
    let gameSource = await fetchBinaryContent(baseUrl$.value, entry.loadConfig.entrypoint);
    if (!gameSource) throw new Error('Failed to load game');
    const isQsps = entry.loadConfig.entrypoint.toLowerCase().endsWith('.qsps');
    if (isQsps) {
      gameSource = convertQsps(gameSource);
    }
    isPaused$.set(false);
    qspApi$.value?.openGame(gameSource, true);
    qspApi$.value?.restartGame();
    currentGameEntry$.set(entry);
    if (descriptor) currentGame$.set(descriptor);
    loadSaveList();
  } catch (e) {
    console.error(e);
    showNotice(e instanceof Error ? e.message : String(e));
    stopCurrentGame();
  }
}

let wasResized = false;
async function applyWindowSettings(window: GameDescriptor['window']): Promise<void> {
  if (window) {
    if (window.width && window.height) {
      await windowManager.resize(window.width, window.height);
      wasResized = true;
    }
    const resizable = window.resizable ?? true;
    windowManager.setResizable(resizable);
    if (resizable) {
      if (window.minWidth && window.minHeight) {
        await windowManager.setMinSize(window.minWidth, window.minHeight);
      }
      if (window.maxWidth && window.maxHeight) {
        await windowManager.setMaxSize(window.maxWidth, window.maxHeight);
      }
    }
    if (window.fullscreen) {
      setTimeout(() => windowManager.goFullscreen(), 0);
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
  onClosePauseScreen();
  pauseScreenCurrentPanel$.set('credits');
  isPaused$.set(true);

  // clear state
  input$.actions.clear();
  menu$.actions.clear();
  msg$.actions.clear();
  mainContent$.set('');
  statsContent$.set('');
  actions$.set([]);
  objects$.set([]);
  cmdText$.set('');

  // clear debugger state
  debugActions.disableDebug();
  debugActions.clearExecutionHistory();
  debugActions.clearEventLog();
  debugActions.clearAllBreakpoints();
  debugActions.selectLocation(null);

  windowManager.setTitle('qSpider');
  windowManager.setIcon(initialBaseUrl$.value, 'favicon.ico');
  windowManager.setResizable(true);
  windowManager.unsetMaxSize();
  windowManager.unsetMinSize();
  if (wasResized) windowManager.resize(1024, 768);

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
export type GameCommand = 'quicksave' | 'quickload' | 'restart' | 'resume' | 'quit' | 'mute' | 'unmute' | 'toggle-mute';

function onRestart(): void {
  reloadRegions();
  reloadLayers();
}
export function onRestore(): void {
  reloadRegions();
  reloadLayers();
}

export function onGameCommand(action: GameCommand): void {
  if (action.startsWith('pause:')) {
    const [, panel] = action.split(':');
    if (!isPauseScreenVisible$.value) openPauseScreen();
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
      closePauseScreen();
      pauseScreenCurrentPanel$.set('credits');
      break;
    case 'resume':
      closePauseScreen();
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
