import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { atom } from 'xoid';
import { clearAdditionalResources, loadAdditionalResources } from './resources';
import { openGameSource, qspApi$, replaceQspEngine, whenQspEngineReady } from './qsp-api';
import { CLASSIC_THEME, currentTheme$, currentTranslations$, registerThemes, themeRegistry$ } from './themes';
import { resetCounterPauses } from './counter';
import { muted$, sounds$ } from './audio';
import {
  closePauseScreen,
  isPauseScreenVisible$,
  onClosePauseScreen,
  openPauseScreen,
  pauseScreenCurrentPanel$,
} from './pause-screen';
import { loadSaveList, quickLoad, quickSave, requestedAction$ } from './save';
import { clearHotkeys, setupCustomHotKeys, setupGlobalHotKeys } from './hotkeys';
import { fetchBinaryContent, fetchTextContent, whenGameFilesReady, windowManager } from '@qspider/env';
import { parseCfg, qspGuiCfg$ } from './qsp-gui-cfg';
import { loadThemeTranslations, unloadThemeTranslations } from '@qspider/i18n';
import { actions$, cmdText$, mainContent$, mainScroll$, objects$, statsContent$, statsScroll$ } from './panels';
import { convertQsps } from './utils';
import { initialBaseUrl$ } from './init';
import { clearDialogs } from './dialogs';
import { showNotice } from './toasts';
import { parseToml } from '@qspider/utils';
import { debugActions } from './debug';
import { resetWatchBaseline, setWatchGame } from './debug-watch';
import { scrollStep } from './qspider-command-parsers';
import { isQspsFile } from './engine-event-logic';
import {
  aeroHeight,
  aeroWidth,
  aeroWindow,
  chooseTheme,
  configXmlSize,
  DEFAULT_AERO_SIZE,
  gameMode,
  parseGameCommand,
  pickDescriptor,
  slotCount,
  windowSettingsPlan,
} from './game-config';

export const currentGameEntry$ = atom<GameShelfEntry | null>(null);
export const currentGame$ = atom<GameDescriptor | null>();
export const currentGameMode$ = atom((get) => gameMode(get(currentGame$)));
export const currentAeroWidth$ = atom((get) => aeroWidth(get(currentGame$)));
export const currentAeroHeight$ = atom((get) => aeroHeight(get(currentGame$)));
export const saveSlotsCount$ = atom((get) => slotCount(get(currentGame$)));
export const onGameEnd$ = atom<null | (() => void)>(null);
export const baseUrl$ = atom('');

// The debugger's watch list is saved per game, by the shelf id saves use too.
currentGameEntry$.subscribe((entry) => setWatchGame(entry?.id ?? null));

export async function runGame(entry: GameShelfEntry): Promise<void> {
  if (!entry) throw new Error('Game not found');
  try {
    // Before any of the game's files is fetched (its config, source, resources, images and sounds).
    await whenGameFilesReady(entry.loadConfig.url);
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
      const found = pickDescriptor(config, entry.id);
      if (!found) throw new Error('Config not found');
      descriptor = found;
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
        descriptor.window = aeroWindow(descriptor.window, descriptor.aero);
      } else {
        try {
          const content = await fetchTextContent(baseUrl$.value, 'config.xml');
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'application/xml');
          const size = configXmlSize(doc);
          if (size) {
            descriptor.aero = size;
            descriptor.window = aeroWindow(descriptor.window, size);
          }
        } catch {
          descriptor.aero = { ...DEFAULT_AERO_SIZE };
          descriptor.window = aeroWindow(descriptor.window, DEFAULT_AERO_SIZE);
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
    // The game's styles, scripts and fonts are in before the engine runs it, so its first text is styled and
    // its scripts hear its first events. A resource that fails is named in a notice; the game starts anyway.
    const failedResources = await loadAdditionalResources(descriptor?.resources);
    if (failedResources.length > 0) showNotice(`Failed to load game resources: ${failedResources.join(', ')}`);
    if (descriptor?.themes) {
      await registerThemes(descriptor.themes);
    }
    const { theme, missing } = chooseTheme(descriptor, (alias) => Boolean(themeRegistry$.value[alias]));
    if (missing) showNotice(`Theme ${missing} not found`);
    currentTheme$.set(theme);
    loadThemeTranslations(currentTranslations$.value);
    if (descriptor) applyWindowSettings(descriptor.window);
    let gameSource = await fetchBinaryContent(baseUrl$.value, entry.loadConfig.entrypoint);
    if (!gameSource) throw new Error('Failed to load game');
    if (isQspsFile(entry.loadConfig.entrypoint)) {
      gameSource = convertQsps(gameSource);
    }
    // A clean slate for the new game: no pause reason left over from the previous one.
    resetCounterPauses();
    // A game stopped just before has its engine replaced; this game starts in the fresh one.
    await whenQspEngineReady();
    if (qspApi$.value) await openGameSource(qspApi$.value, gameSource, true);
    // Not awaited: the promise settles only when the game's start code ends, which may wait in a dialog that
    // shows only once the game is current.
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
  const plan = windowSettingsPlan(window);
  if (!plan) return;
  if (plan.size) {
    await windowManager.resize(plan.size.width, plan.size.height);
    wasResized = true;
  }
  windowManager.setResizable(plan.resizable);
  if (plan.minSize) await windowManager.setMinSize(plan.minSize.width, plan.minSize.height);
  if (plan.maxSize) await windowManager.setMaxSize(plan.maxSize.width, plan.maxSize.height);
  if (plan.fullscreen) {
    setTimeout(() => windowManager.goFullscreen(), 0);
  }
}

baseUrl$.subscribe((url) => {
  const baseTag = document.querySelector<HTMLBaseElement>('#page-base') as HTMLBaseElement;
  baseTag.href = url || '/';
});

export function stopCurrentGame(): void {
  // First: the dialogs cleared below answer the stopped game's engine, and it must not run that game further.
  replaceQspEngine();
  baseUrl$.set(initialBaseUrl$.value);
  currentGameEntry$.set(null);
  currentGame$.set(null);
  qspGuiCfg$.set(null);
  onClosePauseScreen();
  pauseScreenCurrentPanel$.set('credits');

  // clear state
  clearDialogs();
  // After the dialog clears (they resume their own reasons): only "no game" pauses the counter now.
  resetCounterPauses('no-game');
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
  debugActions.resetActionRun();

  windowManager.setTitle('qSpider');
  windowManager.setIcon(initialBaseUrl$.value, 'favicon.ico');
  windowManager.setResizable(true);
  windowManager.unsetMaxSize();
  windowManager.unsetMinSize();
  if (wasResized) windowManager.resize(1024, 768);

  sounds$.actions.clear();
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

/** Asks the player for the saves panel to save or load in (the game's SAVEGAME / OPENGAME without a path, Ctrl+S, Ctrl+O). */
export function requestSavesPanel(action: 'save' | 'load'): void {
  requestedAction$.set(action);
  onGameCommand('pause:saves' as GameCommand);
}

export function onGameCommand(action: GameCommand): void {
  const command = parseGameCommand(action);
  if (command.type === 'pause') {
    if (!isPauseScreenVisible$.value) openPauseScreen();
    pauseScreenCurrentPanel$.set(command.panel);
  } else if (command.type === 'scroll') {
    switch (command.panel) {
      case 'main':
        mainScroll$.update((x) => scrollStep(x, command.direction));
        break;
      case 'stats':
        statsScroll$.update((x) => scrollStep(x, command.direction));
        break;
    }
  }
  switch (action) {
    case 'quit':
      stopCurrentGame();
      break;
    case 'restart':
      resetWatchBaseline(); // the restarted game is a new baseline, not a change
      // Closing the pause screen goes back in history, to the shelf when it is not open, so only an open
      // pause screen is closed. The counter needs no handling here: the pause screen and a library the
      // restart loads (withCounterPaused) each hold their own pause reason and release only that.
      qspApi$.value?.restartGame();
      if (isPauseScreenVisible$.value) closePauseScreen();
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
