import { QspListItem, QspObjectItem } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { qspApi$ } from './qsp-api';
import { isActionIndex, layerFlag, readAll, regionText, view$ } from './panel-logic';

export const mainContent$ = atom('');
export const nextMainContent$ = atom('');
export const isNewLoc$ = atom(false);
export const newLocHash$ = atom('');
/** The new-location effect variables as the game left them at the jump. The engine reports watched variables a tick after main_changed. */
export const newLocEffect$ = atom({ effect: '', time: 500, seq: false });
export const mainScroll$ = atom(0);

export const isStatsVisible$ = atom(false);
export const statsContent$ = atom('');
export const statsScroll$ = atom(0);

export const isActsVisible$ = atom(false);
export const actions$ = atom<QspListItem[]>([]);
export const selectedAction$ = atom(-1);

export function canSelectAction(index: number): boolean {
  return isActionIndex(index, actions$.value.length);
}

export function selectAction(index: number): void {
  selectedAction$.set(index);
  qspApi$.value?.selectAction(index);
}
export function execSelectedAction(): void {
  selectedAction$.set(-1);
  qspApi$.value?.execSelectedAction();
}
/** Picks the action and runs it, as a key for it does. */
export function runAction(index: number): void {
  selectAction(index);
  execSelectedAction();
}

export const isObjsVisible$ = atom(false);
export const selectedObject$ = atom(-1);
export const objects$ = atom<QspObjectItem[]>([]);
export function selectObject(index: number): void {
  qspApi$.value?.selectObject(index);
}

export const isCmdVisible$ = atom(false);
export const cmdText$ = atom('');
export function submitUserInput(): void {
  qspApi$.value?.updateUserInput(cmdText$.value);
}

export { view$ };

export const regions$ = atom<Record<string, string>>({});
export const regionsScroll$ = atom<Record<string, number>>({});
/** The text the game keeps for a region, in `$qspider_region[name]`. */
export function readRegion(name: string): string {
  return regionText(qspApi$.value?.readVariableByKey('$qspider_region', name));
}
export function reloadRegions(): void {
  regions$.set(readAll(Object.keys(regions$.value), readRegion));
}

export const layers$ = atom<Record<string, boolean>>({});
export function readLayerState(name: string): boolean {
  return layerFlag(qspApi$.value?.readVariableByKey('qspider_layers', name));
}
export function registerLayer(name: string): void {
  layers$.update((current) => ({
    ...current,
    [name]: readLayerState(name),
  }));
}
export function reloadLayers(): void {
  layers$.set(readAll(Object.keys(layers$.value), readLayerState));
}
