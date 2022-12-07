import { QspListItem } from '@qsp/wasm-engine';
import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

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

export const regions$ = create<Record<string, string>>({});
