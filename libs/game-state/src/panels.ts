import { QspListItem } from '@qsp/wasm-engine';
import { create } from 'xoid';
import { qspApi$ } from './qsp-api';

export const mainContent$ = create('');
export const isNewLoc$ = create(false);
export const newLocHash$ = create('');
export const mainScroll$ = create(0);

export const isStatsVisible$ = create(false);
export const statsContent$ = create('');
export const statsScroll$ = create(0);

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

export const view$ = create<ViewAtom, ViewAtomActions>(
  {
    isOpen: false,
    path: '',
    isModal: false,
  },
  (atom) => {
    const isOpen$ = atom.focus((s) => s.isOpen);
    return {
      open(path: string): void {
        atom.set({
          isOpen: true,
          path,
          isModal: false,
        });
      },
      setIsModal(isModal: boolean): void {
        atom.value.isModal = isModal;
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

export const regions$ = create<Record<string, string>>({});
export const regionsScroll$ = create<Record<string, number>>({});
export function reloadRegions(): void {
  const newState: Record<string, string> = {};
  for (const name of Object.keys(regions$.value)) {
    newState[name] = qspApi$.value?.readVariableByKey('$qspider_region', name) ?? '';
  }
  regions$.set(newState);
}

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
export function reloadLayers(): void {
  const newState: Record<string, boolean> = {};
  for (const key of Object.keys(layers$.value)) {
    newState[key] = readLayerState(key);
  }
  layers$.set(newState);
}
