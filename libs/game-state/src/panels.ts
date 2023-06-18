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
export const selectedAction$ = create(-1);
export function selectAction(index: number): void {
  selectedAction$.set(index);
  qspApi$.value?.selectAction(index);
}
export function execSelectedAction(): void {
  selectedAction$.set(-1);
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
export const isViewVisible$ = create(false);
export const isViewModal$ = create(false);

export const regions$ = create<Record<string, string>>({});

export const layers$ = create<Record<string, boolean>>({});
export function readLayerState(name: string): boolean {
  return Boolean(qspApi$.value?.readVariableByKey('qspider_layers', name) ?? 0);
}
export function registerLayer(name: string): void {
  layers$.update((current) => ({
    ...current,
    [name]: readLayerState(name),
  }));
}
