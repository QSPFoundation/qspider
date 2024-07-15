import { atom } from 'xoid';
import produce from 'immer';
import { nanoid } from 'nanoid';
import { UniqueIdentifier } from '@dnd-kit/core';

export type DockType = 'top' | 'left' | 'right' | 'bottom';

export interface LayoutLayer {
  top?: LayerDock;
  left?: LayerDock;
  right?: LayerDock;
  bottom?: LayerDock;
}

export interface LayerDock {
  id: UniqueIdentifier;
  size: number;
  panes: DockPane[];
}

export interface DockPane {
  type: PaneType | 'unknown';
  proportion: number;
  id: UniqueIdentifier;
}

export type PaneType = 'objs' | 'vars' | 'acts' | 'input' | 'imgview';
const allPaneTypes: PaneType[] = ['objs', 'vars', 'acts', 'input', 'imgview'];

export const layers$ = atom<LayoutLayer[]>([{}]);
export const maxLayerIndex$ = atom((get) => get(layers$).length - 1);
export const isViewFloating$ = atom(true);
export const mode$ = atom<'edit' | 'preview'>('edit');

export const usedPanes$ = atom((get) => {
  const used = new Set<PaneType>();
  for (const layer of get(layers$)) {
    for (const pane of layer.top?.panes ?? []) {
      if (pane.type !== 'unknown') used.add(pane.type);
    }
    for (const pane of layer.bottom?.panes ?? []) {
      if (pane.type !== 'unknown') used.add(pane.type);
    }
    for (const pane of layer.left?.panes ?? []) {
      if (pane.type !== 'unknown') used.add(pane.type);
    }
    for (const pane of layer.right?.panes ?? []) {
      if (pane.type !== 'unknown') used.add(pane.type);
    }
  }
  return [...used];
});

export const availablePanes$ = atom((get) => {
  const used = get(usedPanes$);
  return allPaneTypes.filter((p) => !used.includes(p));
});

export const dockToConfigure$ = atom<null | {
  index: number;
  type: DockType;
}>(null);
export const dockToConfigureData$ = atom((get) => {
  const dockToConfigure = get(dockToConfigure$);
  if (!dockToConfigure) return null;
  const layers = get(layers$);
  const layer = layers[dockToConfigure.index];
  return layer?.[dockToConfigure.type];
});

export function toggleMode(): void {
  mode$.update((m) => (m === 'edit' ? 'preview' : 'edit'));
}

export function addLayer(): void {
  layers$.update((v) => [...v, {}]);
}

export function addDock(index: number, type: DockType): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      draft[index][type] = {
        id: nanoid(),
        size: 200,
        panes: [{ type: 'unknown', proportion: 100, id: nanoid() }],
      };
    }),
  );
}

export function configureDock(index: number, type: DockType): void {
  dockToConfigure$.set({ index, type });
}

export function updateDockSize(index: number, type: DockType, size: number): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.size = size;
      }
    }),
  );
}

export function changeDockSize(index: number, type: DockType, delta: number): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.size += delta;
      }
    }),
  );
}

export function addPane(index: number, type: DockType): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.panes.push({ type: 'unknown', proportion: 100, id: nanoid() });
      }
    }),
  );
}
export function removePane(index: number, type: DockType, paneIndex: number): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.panes.splice(paneIndex, 1);
      }
    }),
  );
}

export function changePaneType(index: number, type: DockType, paneIndex: number, value: PaneType): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.panes[paneIndex].type = value;
      }
    }),
  );
}

export function changePaneProportion(index: number, type: DockType, paneIndex: number, value: number): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      const dock = draft[index][type];
      if (dock) {
        dock.panes[paneIndex].proportion = value;
      }
    }),
  );
}

export function removeDock(index: number, type: DockType): void {
  layers$.update((l) =>
    produce(l, (draft) => {
      delete draft[index][type];
    }),
  );
}

const dockDimensions: Record<DockType, 'width' | 'height'> = {
  top: 'height',
  left: 'width',
  right: 'width',
  bottom: 'height',
};
export function getDockDimension(type: DockType): 'width' | 'height' {
  return dockDimensions[type];
}
export function isHorizontalDock(type: DockType): boolean {
  return type === 'top' || type === 'bottom';
}
