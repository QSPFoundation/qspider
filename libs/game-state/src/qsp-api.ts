import {
  initQspEngine,
  QspAPI,
  QspErrorData,
  QspVariableType,
  QspListItem,
  DebugRecord as QspDebugRecord,
  QspEventLogger,
} from '@qsp/wasm-engine';
import { atom } from 'xoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from '@qsp/wasm-engine/qsp-engine.wasm?url';
import { useEffect, useState } from 'react';
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
import { checkCondition } from './conditions';
import { showError } from './toasts';

export const qspApi$ = atom<QspAPI>();
export const qspApiInitialized$ = atom(false);
/**
 * Counts the games opened as new. Opening a new game wipes the engine's variable watchers, so every
 * module-level watcher must subscribe again when this changes.
 */
export const gameOpenEpoch$ = atom(0);

/** Opens a game in the engine; a new game wipes its variable watchers, which `gameOpenEpoch$` announces. */
export function openGameSource(api: QspAPI, source: ArrayBuffer, isNewGame: boolean): void {
  api.openGame(source, isNewGame);
  if (isNewGame) gameOpenEpoch$.update((n) => n + 1);
}
export const qspError$ = atom<QspErrorData | null>(null);
export const qspiderModule$ = atom(writeQsp(readQsps(qspiderModuleContent)));

// Event logger implementation
const eventLogger: QspEventLogger = {
  log(event, ...args) {
    debugActions.logEvent(event, ...args);
  },
};

export async function initQspApi(): Promise<void> {
  const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
  const api = await initQspEngine(wasm);
  console.log(`QSP version: ${api.version()} ${api.getCompiledDateTime()}`);

  // Register event logger
  api.registerEventLogger(eventLogger);

  qspApi$.set(api);
  qspApiInitialized$.set(true);
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
  return qspApi$.value?.getLocationCode(name) || [];
}

export function getActionCode(location: string, index: number): string[] {
  return qspApi$.value?.getActionCode(location, index) || [];
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

export function useQspVariable<Name extends string, T = QspVariableType<Name>>(
  name: Name | undefined,
  key: string,
  index: number,
  defaultValue: T,
): T {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    if (!name) return;
    const unsubscribe = key
      ? qspApi$.value?.watchVariableByKey(name, key, (value) => setValue((value as unknown as T) || defaultValue))
      : qspApi$.value?.watchVariableByIndex(name, index, (value) => setValue((value as unknown as T) || defaultValue));
    return (): void => {
      unsubscribe?.();
    };
  }, [name, key, index, defaultValue]);

  return value;
}

export function useQspExpression(variable: string, condition: [string, string]): boolean {
  const [value, setValue] = useState(false);
  useEffect(() => {
    if (!variable) return;
    const unsubscribe = qspApi$.value?.watchVariable(variable, (value) => {
      setValue(checkCondition(value, condition));
    });
    return (): void => {
      unsubscribe?.();
    };
  }, [variable, condition]);
  return value;
}

qspApi$.subscribe((api) => {
  api.on('version', (type, callback) => {
    return callback(versionAnswer(type, windowManager) ?? api.version());
  });
  api.on('error', qspError$.set);
  api.on('system_cmd', (cmd: string): void => {
    const _cmd = parseSystemCmd(cmd);
    if (_cmd === null) return;
    for (const [prefix, processor] of Object.entries(qspiderCommands)) {
      if (_cmd.trim().startsWith(prefix)) {
        const data = _cmd.replace(prefix, '');
        processor(data);
      }
    }
  });
  api.on('is_play', (path, result) => {
    result(sounds$.actions.isPlaying(path));
  });
  api.on('play_file', (path, volume, ready) => {
    sounds$.actions.play(cleanPath(path), volume);
    ready();
  });
  api.on('close_file', (path, ready) => {
    if (path) {
      sounds$.actions.close(path);
    } else {
      sounds$.actions.closeAll();
    }
    ready();
  });
  api.on('timer', (ms) => {
    counterDelay$.set(ms);
  });
  api.on('open_game', async (file, isNewGame, onOpened) => {
    if (file === 'qspider') {
      api.openGame(qspiderModule$.value, false);
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
        openGameSource(api, gameSource, isNewGame);
      } catch (error) {
        showError(`Failed to open ${file}: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        onOpened();
      }
    });
  });
  api.on('input', (text, finished) => {
    input$.actions.open(text, finished);
  });
  api.on('menu', (items, select) => {
    menu$.actions.open(prepareList(items), select);
  });
  api.on('msg', (text, closed) => {
    msg$.actions.open(text, closed);
  });
  api.on('main_changed', (text) => {
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
  api.on('stats_changed', (text) => {
    statsContent$.set(prepareContent(text));
  });
  api.on('actions_changed', (actions) => {
    actions$.set(prepareList(actions));
  });
  api.on('objects_changed', (objects) => {
    objects$.set(prepareObjectList(objects));
  });
  api.on('user_input', (text) => {
    cmdText$.set(text);
  });
  api.on('view', (path) => {
    if (path) {
      view$.actions.open(cleanPath(path));
    } else {
      view$.actions.close();
    }
  });
  api.on('panel_visibility', (type, isShown) => {
    const panels = panelVisibility(type);
    if (panels.stats) isStatsVisible$.set(isShown);
    if (panels.acts) isActsVisible$.set(isShown);
    if (panels.objs) isObjsVisible$.set(isShown);
    if (panels.cmd) isCmdVisible$.set(isShown);
  });
  api.on('load_save', async (path, loaded) => {
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
  api.on('save_game', async (path, saved) => {
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
  api.on('wait', (ms, finish) => {
    wait$.set({ ms, finish });
  });
  api.on('debug', (debugRecord: QspDebugRecord, resume: () => void) => {
    debugActions.setCurrentRecord(debugRecord, resume);
  });
});
