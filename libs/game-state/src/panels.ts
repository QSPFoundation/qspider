import { QspListItem } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { qspApi$ } from './qsp-api';

export const mainContent$ = atom('');
export const nextMainContent$ = atom('');
export const isNewLoc$ = atom(false);
export const newLocHash$ = atom('');
export const mainScroll$ = atom(0);

export const isStatsVisible$ = atom(false);
export const statsContent$ = atom('');
export const statsScroll$ = atom(0);

export const isActsVisible$ = atom(false);
export const actions$ = atom<QspListItem[]>([]);
export const selectedAction$ = atom(-1);

export function canSelectAction(index: number): boolean {
  return index >= 0 && index < actions$.value.length;
}

export function selectAction(index: number): void {
  selectedAction$.set(index);
  qspApi$.value?.selectAction(index);
}
export function execSelectedAction(): void {
  selectedAction$.set(-1);
  qspApi$.value?.execSelectedAction();
}

export const isObjsVisible$ = atom(false);
export const selectedObject$ = atom(-1);
export const objects$ = atom<QspListItem[]>([]);
export function selectObject(index: number): void {
  qspApi$.value?.selectObject(index);
}

export const isCmdVisible$ = atom(false);
export const cmdText$ = atom('');
export function submitUserInput(): void {
  qspApi$.value?.updateUserInput(cmdText$.value);
}

interface ViewAtom {
  isOpen: boolean;
  path: string;
  isModal: boolean;
}
interface ViewAtomActions {
  open(path: string): void;
  setIsModal(isModal: boolean): void;
  close(): void;
  clear(): void;
}

export const view$ = atom<ViewAtom, ViewAtomActions>(
  {
    isOpen: false,
    path: '',
    isModal: false,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    const isModal$ = atom.focus((s) => s.isModal);
    return {
      open(path: string): void {
        atom.set({
          isOpen: true,
          path,
          isModal: isModal$.value,
        });
      },
      setIsModal(isModal: boolean): void {
        isModal$.set(isModal);
      },
      close(): void {
        isOpen$.set(false);
      },
      clear(): void {
        atom.set({
          isOpen: false,
          path: '',
          isModal: false,
        });
      },
    };
  },
);

export const regions$ = atom<Record<string, string>>({});
export const regionsScroll$ = atom<Record<string, number>>({});
export function reloadRegions(): void {
  const newState: Record<string, string> = {};
  for (const name of Object.keys(regions$.value)) {
    newState[name] = qspApi$.value?.readVariableByKey('$qspider_region', name) ?? '';
  }
  regions$.set(newState);
}

export const layers$ = atom<Record<string, boolean>>({});
export function readLayerState(name: string): boolean {
  return Boolean(qspApi$.value?.readVariableByKey('qspider_layers', name) ?? 0);
}
export function registerLayer(name: string): void {
  layers$.update((current) => ({
    ...current,
    [name]: readLayerState(name),
  }));
}
export function reloadLayers(): void {
  const newState: Record<string, boolean> = {};
  for (const key of Object.keys(layers$.value)) {
    newState[key] = readLayerState(key);
  }
  layers$.set(newState);
}
