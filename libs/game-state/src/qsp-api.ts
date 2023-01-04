import { initQspEngine, QspAPI, QspErrorData, QspPanel, QspVaribleType } from '@qsp/wasm-engine';
import { create, use } from 'xoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from '@qsp/wasm-engine/qsp-engine.wasm';
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
  newLocHash$,
  objects$,
  regions$,
  statsContent$,
  viewPath$,
} from './panels';
import { currentGame$, onGameAction } from './current-game';
import { gameSavedCallback$, saveLoadedCallback$ } from './save';
import { counterDelay$, withCounterPaused } from './counter';
import { storage$ } from './storage';
import { wait$ } from './wait';
import { convertQsps, prepareContent, prepareList } from './utils';
import { hashString } from '@qspider/utils';
import { menu$ } from './menu';
import { input$ } from './input';
import { basePath$, getBinaryContent, getResource } from './resources';
import { sounds$ } from './audio';
import { msg$ } from './msg';
import { windowManager$ } from './window-manager';

export const qspApi$ = create<QspAPI>();
export const qspApiInitialized$ = create(false);
export const platform$ = create('browser');
export const qspError$ = create<QspErrorData | null>(null);

export async function initQspApi(): Promise<void> {
  const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
  const api = await initQspEngine(wasm);
  console.log(`QSP version: ${api.version()}`);
  qspApi$.set(api);
  qspApiInitialized$.set(true);
}

export function execCode(code: string): void {
  qspApi$.value?.execCode(code);
}

export function onLinkClicked(href: string): void {
  if (href.toLowerCase().startsWith('exec:')) {
    execCode(href.substring(5));
  } else {
    window.location.href = href;
  }
}

export function useQspVariable<Name extends string, T = QspVaribleType<Name>>(
  name: Name | undefined,
  key: string,
  index: number,
  defaultValue: T
): T {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    if (!name) return;
    const unsubscribe = key
      ? qspApi$.value?.watchVariableByKey(name, key, (value) => setValue(value as unknown as T))
      : qspApi$.value?.watchVariable(name, index, (value) => setValue(value as unknown as T));
    return () => unsubscribe?.();
  }, [name, key, index]);

  return value;
}

export function useQspExpression(expr: string): boolean {
  const [value, setValue] = useState(false);
  useEffect(() => {
    if (!expr) return;
    const unsubscribe = qspApi$.value?.watchExpression(expr, (v) => setValue(Boolean(v)));
    return () => unsubscribe?.();
  }, [expr]);
  return value;
}

qspApi$.subscribe((api) => {
  api.on('version', (type, callback) => {
    switch (type) {
      case 'player':
        return callback('qSpider');
      case 'platform':
        return callback(platform$.value);
    }
    return callback(api.version());
  });
  api.on('error', qspError$.set);
  api.on('system_cmd', (cmd: string): void => {
    if (!cmd.startsWith('qspider')) return;
    const [, _cmd] = cmd.split('.');
    if (_cmd.startsWith('event:')) {
      const [, event] = _cmd.split(':');
      const match = event.trim().match(/(.*?)(\[(.*?)\])/i);
      if (match) {
        const name = match[1];
        const args = match[3].split(',').map((arg) => {
          const prepared = arg.trim();
          if (prepared.startsWith('"') || prepared.startsWith("'")) {
            return prepared.replace(/['"](.*?)['"]/gim, (_, path) => path);
          }
          return parseInt(prepared);
        });
        window.dispatchEvent(
          new CustomEvent('qspider-event', {
            detail: { name, args },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('qspider-event', {
            detail: { name: event.trim() },
          })
        );
      }
    } else if (_cmd.startsWith('update_region:')) {
      const [, name] = _cmd.split(':');
      const region$ = regions$.focus((s) => s[name]);
      region$.set(api.readVariableByKey('$qspider_region', name));
    } else if (_cmd.startsWith('fullscreen:')) {
      const [, state] = _cmd.split(':');
      if (state === 'on') {
        windowManager$.value?.goFullscreen();
      } else {
        windowManager$.value?.goWindowed();
      }
    }
  });
  api.on('is_play', (path, result) => {
    result(use(sounds$).isPlaying(getResource(path).url));
  });
  api.on('play_file', (path, volume, ready) => {
    use(sounds$).play(getResource(path), volume);
    ready();
  });
  api.on('close_file', (path, ready) => {
    if (path) {
      use(sounds$).close(getResource(path).url);
    } else {
      use(sounds$).closeAll();
    }
    ready();
  });
  api.on('timer', (ms) => {
    counterDelay$.set(ms);
  });
  api.on('open_game', async (file, isNewGame, onOpened) => {
    withCounterPaused(async () => {
      const source = await getBinaryContent(file);
      let gameSource = source;
      const isQsps = file.toLowerCase().endsWith('.qsps');
      if (isQsps) {
        gameSource = convertQsps(source);
      }
      if (isNewGame) {
        basePath$.set(file.slice(0, file.lastIndexOf('/') + 1));
      }
      api.openGame(gameSource, isNewGame);
      onOpened();
    });
  });
  api.on('input', (text, finished) => {
    input$.set({ text, finished });
  });
  api.on('menu', (items, select) => {
    menu$.set({
      items: prepareList(items),
      select,
    });
  });
  api.on('msg', (text, closed) => {
    msg$.set({ text, closed });
  });
  api.on('main_changed', (text) => {
    const prevMain = mainContent$.value;
    mainContent$.set(prepareContent(text));
    isNewLoc$.set(!prevMain || (mainContent$.value !== prevMain && !mainContent$.value.startsWith(prevMain)));
    if (isNewLoc$.value) {
      newLocHash$.set(String(hashString(mainContent$.value)));
    }
  });
  api.on('stats_changed', (text) => {
    statsContent$.set(prepareContent(text));
  });
  api.on('actions_changed', (actions) => {
    actions$.set(prepareList(actions));
  });
  api.on('objects_changed', (objects) => {
    objects$.set(prepareList(objects));
  });
  api.on('user_input', (text) => {
    cmdText$.set(text);
  });
  api.on('view', (path) => {
    viewPath$.set(path);
  });
  api.on('panel_visibility', (type, isShown) => {
    switch (type) {
      case QspPanel.VARS:
        isStatsVisible$.set(isShown);
        break;
      case QspPanel.ACTS:
        isActsVisible$.set(isShown);
        break;
      case QspPanel.OBJS:
        isObjsVisible$.set(isShown);
        break;
      case QspPanel.INPUT:
        isCmdVisible$.set(isShown);
        break;
    }
  });
  api.on('load_save', async (path, loaded) => {
    const currentGame = currentGame$.value;
    if (!currentGame) return loaded();
    if (path) {
      await withCounterPaused(async () => {
        const saveData = await storage$.value?.getSaveDataByKey(currentGame.id, path);
        loaded();
        if (saveData) {
          api.loadSave(saveData);
        }
      });
    } else {
      saveLoadedCallback$.set(loaded);
      onGameAction('load');
    }
  });
  api.on('save_game', async (path, saved) => {
    const currentGame = currentGame$.value;
    if (!currentGame) return saved();
    if (path) {
      await withCounterPaused(async () => {
        const saveData = api.saveGame();
        if (!saveData) return saved();
        await storage$.value?.saveByKey(currentGame.id, path, saveData);
        saved();
      });
    } else {
      gameSavedCallback$.set(saved);
      onGameAction('save');
    }
  });
  api.on('wait', (ms, finish) => {
    wait$.set({ ms, finish });
  });
});
