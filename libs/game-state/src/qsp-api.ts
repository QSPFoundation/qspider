import {
  initQspEngine,
  QspAPI,
  QspErrorData,
  QspListItem,
  DebugRecord as QspDebugRecord,
  QspEventLogger,
  QspEvents,
} from '@qsp/wasm-engine';
import { atom } from 'xoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from '@qsp/wasm-engine/qsp-engine.wasm?url';
import {
  actions$,
  cmdText$,
  isActsVisible$,
  isCmdVisible$,
  isNewLoc$,
  isObjsVisible$,
  isStatsVisible$,
  mainContent$,
  newLocEffect$,
  newLocHash$,
  nextMainContent$,
  objects$,
  statsContent$,
  view$,
} from './panels';
import { baseUrl$, currentGameEntry$, requestSavesPanel } from './current-game';
import { gameSavedCallback$, restoreFromPath, saveLoadedCallback$, saveToPath } from './save';
import { counterDelay$, withCounterPaused } from './counter';
import { wait$ } from './wait';
import { convertQsps, prepareContent, prepareList, prepareObjectList } from './utils';
import { cleanPath, hashString } from '@qspider/utils';
import { menu$ } from './menu';
import { input$ } from './input';
import { sounds$ } from './audio';
import { msg$ } from './msg';
import { qspiderCommands } from './qspider-commands';
import { parseSystemCmd } from './qspider-command-parsers';
import {
  gameFileUrl,
  isExecHref,
  isNewLoc,
  isQspsFile,
  newLocEffect,
  panelVisibility,
  saveTarget,
  shouldPauseOnLink,
  stripExec,
  versionAnswer,
} from './engine-event-logic';
import { debugActions } from './debug';
import qspiderModuleContent from './modules/qspider.qsps?raw';
import { readQsps, writeQsp } from '@qsp/converters';
import { fetchBinaryContent, windowManager } from '@qspider/env';
import { showError } from './toasts';

export const qspApi$ = atom<QspAPI>();
export const qspApiInitialized$ = atom(false);
/**
 * Counts the games opened as new. Opening a new game wipes the engine's variable watchers, so the variable layer
 * (variables.ts) re-attaches its watchers when this changes.
 */
export const gameOpenEpoch$ = atom(0);

/** Opens a game in the engine; a new game wipes its variable watchers, which `gameOpenEpoch$` announces. */
export async function openGameSource(api: QspAPI, source: ArrayBuffer, isNewGame: boolean): Promise<void> {
  await api.openGame(source, isNewGame);
  if (isNewGame) gameOpenEpoch$.update((n) => n + 1);
}
export const qspError$ = atom<QspErrorData | null>(null);
export const qspiderModule$ = atom(writeQsp(readQsps(qspiderModuleContent)));

let wasmBinary: ArrayBuffer | null = null;
let engineReady: Promise<void> = Promise.resolve();
/**
 * Engines of stopped games. A stopped game may still be inside a statement (a dialog it waits in, or code the
 * engine resumes a tick after an answer): its engine's events are ignored and never answered, so that game's
 * code never reaches the player again, and an engine left waiting can't hold up the next game.
 */
const retiredApis = new WeakSet<QspAPI>();

async function startEngine(): Promise<void> {
  if (!wasmBinary) throw new Error('QSP engine is not loaded');
  const api = await initQspEngine(wasmBinary);
  const eventLogger: QspEventLogger = {
    log(event, ...args) {
      if (!retiredApis.has(api)) debugActions.logEvent(event, ...args);
    },
  };
  api.registerEventLogger(eventLogger);
  qspApi$.set(api);
}

export async function initQspApi(): Promise<void> {
  wasmBinary = await fetch(wasmUrl).then((r) => r.arrayBuffer());
  engineReady = startEngine();
  await engineReady;
  const api = qspApi$.value;
  if (api) console.log(`QSP version: ${api.version()} ${api.getCompiledDateTime()}`);
  qspApiInitialized$.set(true);
}

/** Retires the engine of the game that stopped (see `retiredApis`) and starts a fresh one for the next game. */
export function replaceQspEngine(): void {
  const api = qspApi$.value;
  if (!api || !wasmBinary) return;
  retiredApis.add(api);
  engineReady = startEngine();
  engineReady.catch((error) => console.error('Failed to start the QSP engine', error));
}

/** Settles when the engine a game starts in is ready (after `replaceQspEngine`, the fresh one). */
export function whenQspEngineReady(): Promise<void> {
  return engineReady;
}

export function execCode(code: string): void {
  const api = qspApi$.value;
  if (!api) return;

  // Check if debug mode is enabled and should pause on link execution
  if (shouldPauseOnLink(debugActions.getDebugState())) {
    // Create a synthetic debug record for the link execution
    debugActions.setLinkExecution(code, () => {
      api.execCode(code);
    });
  } else {
    api.execCode(code);
  }
}

export function enableDebugMode(): void {
  qspApi$.value?.enableDebugMode();
  debugActions.enableDebug();
}

export function disableDebugMode(): void {
  qspApi$.value?.disableDebugMode();
  debugActions.disableDebug();
}

export function getLocationsList(): string[] {
  return qspApi$.value?.getLocationsList() || [];
}

export function getLocationCode(name: string): string[] {
  return qspApi$.value?.getLocationCode(name).map((entry) => entry.code) || [];
}

/** The code of a base action of a location (not a dynamic one). */
export function getActionCode(location: string, index: number): string[] {
  return qspApi$.value?.getLocationActionCode(location, index).map((entry) => entry.code) || [];
}

export function getLocationActions(name: string): QspListItem[] {
  return qspApi$.value?.getLocationActions(name) || [];
}

export function getLocationDescription(name: string): string {
  return qspApi$.value?.getLocationDescription(name) || '';
}

export function onLinkClicked(href: string): void {
  if (isExecHref(href)) {
    execCode(stripExec(href));
  } else {
    window.location.href = href;
  }
}

qspApi$.subscribe((api) => {
  // Every listener of a retired engine goes silent (see `retiredApis`).
  function on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    const call = listener as (...args: unknown[]) => unknown;
    api.on(event, ((...args: unknown[]) => (retiredApis.has(api) ? undefined : call(...args))) as QspEvents[E]);
  }
  on('version', (type, callback) => {
    return callback(versionAnswer(type, windowManager) ?? api.version());
  });
  on('error', qspError$.set);
  on('system_cmd', (cmd: string): void => {
    const _cmd = parseSystemCmd(cmd);
    if (_cmd === null) return;
    for (const [prefix, processor] of Object.entries(qspiderCommands)) {
      if (_cmd.trim().startsWith(prefix)) {
        const data = _cmd.replace(prefix, '');
        processor(data);
      }
    }
  });
  on('is_play', (path, result) => {
    result(sounds$.actions.isPlaying(path));
  });
  on('play_file', (path, volume, ready) => {
    sounds$.actions.play(cleanPath(path), volume);
    ready();
  });
  on('close_file', (path, ready) => {
    if (path) {
      sounds$.actions.close(path);
    } else {
      sounds$.actions.closeAll();
    }
    ready();
  });
  on('timer', (ms) => {
    counterDelay$.set(ms);
  });
  on('open_game', async (file, isNewGame, onOpened) => {
    if (file === 'qspider') {
      await api.openGame(qspiderModule$.value, false);
      onOpened();
      return;
    }
    // The engine is suspended inside the statement until onOpened() is called, and it has no failure channel:
    // onOpened() must run exactly once on every path (a failed fetch, convert or engine open included), so the
    // statement goes on as if the file added nothing.
    await withCounterPaused(async () => {
      try {
        const source = await fetchBinaryContent(baseUrl$.value, file);
        const gameSource = isQspsFile(file) ? convertQsps(source) : source;
        if (isNewGame) {
          baseUrl$.update((url) => gameFileUrl(url, cleanPath(file)));
        }
        await openGameSource(api, gameSource, isNewGame);
      } catch (error) {
        showError(`Failed to open ${file}: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        onOpened();
      }
    });
  });
  on('input', (text, finished) => {
    input$.actions.open(text, finished);
  });
  on('menu', (items, select) => {
    menu$.actions.open(prepareList(items), select);
  });
  on('msg', (text, closed) => {
    msg$.actions.open(text, closed);
  });
  on('main_changed', (text) => {
    const prevMain = mainContent$.value;
    const nextMain = prepareContent(text);
    const newLoc = isNewLoc(prevMain, nextMain);
    isNewLoc$.set(newLoc);
    nextMainContent$.set(nextMain);
    if (newLoc) {
      newLocEffect$.set(newLocEffect((name) => api.readVariable(name)));
      newLocHash$.set(String(hashString(nextMainContent$.value)));
    } else {
      mainContent$.set(nextMain);
    }
  });
  on('stats_changed', (text) => {
    statsContent$.set(prepareContent(text));
  });
  on('actions_changed', (actions) => {
    actions$.set(prepareList(actions));
  });
  on('objects_changed', (objects) => {
    objects$.set(prepareObjectList(objects));
  });
  on('user_input', (text) => {
    cmdText$.set(text);
  });
  on('view', (path) => {
    if (path) {
      view$.actions.open(cleanPath(path));
    } else {
      view$.actions.close();
    }
  });
  on('panel_visibility', (type, isShown) => {
    const panels = panelVisibility(type);
    if (panels.stats) isStatsVisible$.set(isShown);
    if (panels.acts) isActsVisible$.set(isShown);
    if (panels.objs) isObjsVisible$.set(isShown);
    if (panels.cmd) isCmdVisible$.set(isShown);
  });
  on('load_save', async (path, loaded) => {
    const target = saveTarget(Boolean(currentGameEntry$.value), path);
    if (target === 'answer-now') return loaded();
    saveLoadedCallback$.set(() => {
      loaded();
    });
    if (target === 'path') {
      await restoreFromPath(path);
    } else {
      requestSavesPanel('load');
    }
  });
  on('save_game', async (path, saved) => {
    const target = saveTarget(Boolean(currentGameEntry$.value), path);
    if (target === 'answer-now') return saved();
    gameSavedCallback$.set(() => {
      saved();
    });
    if (target === 'path') {
      await saveToPath(path);
    } else {
      requestSavesPanel('save');
    }
  });
  on('wait', (ms, finish) => {
    wait$.set({ ms, finish });
  });
  on('debug', (debugRecord: QspDebugRecord, resume: () => void) => {
    debugActions.setCurrentRecord(debugRecord, resume);
  });
});
