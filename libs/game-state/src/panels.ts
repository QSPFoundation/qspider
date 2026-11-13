import { QspListItem, QspObjectItem } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { qspApi$ } from './qsp-api';
import { isActionIndex, NO_ACTION, selectedAction$, view$ } from './panel-logic';

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
export { selectedAction$ };

export function canSelectAction(index: number): boolean {
  return isActionIndex(index, actions$.value.length);
}

export function selectAction(index: number): Promise<void> | undefined {
  selectedAction$.set(index);
  return qspApi$.value?.selectAction(index);
}
export function execSelectedAction(): Promise<void> | undefined {
  selectedAction$.set(NO_ACTION);
  return qspApi$.value?.execSelectedAction();
}
/** Picks the action and runs it, as a key for it does; the game's `$ONACTSEL` code finishes first. */
export async function runAction(index: number): Promise<void> {
  await selectAction(index);
  await execSelectedAction();
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

export const regionsScroll$ = atom<Record<string, number>>({});
