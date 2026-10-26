import type { DockPlace } from '@qspider/game-state';

/** The numbers of a classic `<table>`: border 0, cellspacing 0 and cellpadding 1 when not written. */
export function tableDimensions(attrs: { border?: string; cellspacing?: string; cellpadding?: string }): {
  border: number;
  cellspacing: number;
  cellpadding: number;
} {
  const { border = '0', cellspacing = '0', cellpadding = '1' } = attrs;
  return { border: Number(border), cellspacing: Number(cellspacing), cellpadding: Number(cellpadding) };
}

/** The place, visibility and size of `<qsp-cl-dock>`: centre and size 0 when not written. */
export function dockAttributes(
  place: string | null,
  visibility: string | null,
  size: string | null,
): { place: DockPlace; visibility: string | null; size: number } {
  return { place: (place || 'center') as DockPlace, visibility, size: Number(size ?? 0) };
}

/** The visibility and proportion of `<qsp-cl-pane>`: proportion 1 when not written. */
export function paneAttributes(
  visibility: string | null,
  proportion: string | null,
): { visibility: string | null; proportion: number } {
  return { visibility, proportion: Number(proportion ?? 1) };
}
