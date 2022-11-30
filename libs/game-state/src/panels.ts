import { QspListItem, QspPanel } from '@qsp/wasm-engine';
import { hashString } from '@qspider/utils';
import { create } from 'xoid';
import { qspApi$ } from './qsp-api';
import { prepareContent, prepareList } from './utils';

export const mainContent$ = create('');
export const isNewLoc$ = create(false);
export const newLocHash$ = create('');

export const isStatsVisible$ = create(false);
export const statsContent$ = create('');

export const isActsVisible$ = create(false);
export const actions$ = create<QspListItem[]>([]);
export function selectAction(index: number): void {
  qspApi$.value?.selectAction(index);
}
export function execSelectedAction(): void {
  qspApi$.value?.execSelectedAction();
}

export const isObjsVisible$ = create(false);
export const objects$ = create<QspListItem[]>([]);
export function selectObject(index: number): void {
  qspApi$.value?.selectObject(index);
}

export const isCmdVisible$ = create(false);
export const cmdText$ = create('');
export function submitUserInput(): void {
  qspApi$.value?.updateUserInput(cmdText$.value);
}

export const viewPath$ = create('');

qspApi$.subscribe((api) => {
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
});
