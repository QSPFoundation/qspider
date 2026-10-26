import type { CfgData, DockPlace } from '@qspider/game-state';
import { convertColor, getContrastColor, invertColor } from '@qspider/utils';

/**
 * A dock with a falsy visibility (null or an empty string) is always shown;
 * otherwise it is shown when any of the `|`-separated panels is visible.
 */
export function isDockVisible(visibility: string | null, isPanelVisible: (panel: string) => boolean): boolean {
  if (!visibility) return true;
  return visibility.split('|').some((panel) => isPanelVisible(panel));
}

export function isPaneVisible(visibility: string | null, isPanelVisible: (panel: string) => boolean): boolean {
  if (!visibility) return true;
  return isPanelVisible(visibility);
}

export function layerGridStyle(docks: Partial<Record<DockPlace, { size: number }>>): {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridTemplateAreas: string;
} {
  const areas = ['center'];
  let columns = '1fr';
  let columnsNumber = 1;
  let rows = '1fr';
  if (docks['left']) {
    areas[0] = 'left ' + areas[0];
    columnsNumber++;
    columns = `${docks['left'].size}px ` + columns;
  }
  if (docks['right']) {
    areas[0] += ' right';
    columnsNumber++;
    columns += ` ${docks['right'].size}px`;
  }
  if (docks['top']) {
    rows = `${docks['top'].size}px ` + rows;
    areas.unshift('top '.repeat(columnsNumber).trim());
  }
  if (docks['bottom']) {
    rows += ` ${docks['bottom'].size}px`;
    areas.push('bottom '.repeat(columnsNumber).trim());
  }
  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: '"' + areas.join('" "') + '"',
  };
}

export function classicDefaultRules(
  config: Pick<CfgData, 'BackColor' | 'FontColor' | 'LinkColor' | 'FontSize' | 'FontName'>,
): string[] {
  const rules: string[] = [];
  if (config.BackColor) {
    const color = convertColor(config.BackColor, false);
    if (color) {
      const inverted = invertColor(color);
      rules.push(`--cl-background-color: ${color}`);
      rules.push(`--cl-background-color-contrast: ${getContrastColor(color)}`);
      rules.push(`--cl-background-color-inverted: ${inverted}`);
      rules.push(`--cl-background-color-inverted-contrast: ${getContrastColor(inverted)}`);
    }
  }
  if (config.FontColor) {
    const color = convertColor(config.FontColor, false);
    if (color) {
      rules.push(`--cl-color: ${color}`);
    }
  }
  if (config.LinkColor) {
    const color = convertColor(config.LinkColor, false);
    if (color) {
      rules.push(`--cl-link-color: ${color}`);
    }
  }
  if (config.FontSize) {
    rules.push(`--cl-font-size: ${config.FontSize}pt`);
  }
  if (config.FontName) {
    rules.push(`--cl-font-name: ${config.FontName}`);
  }
  return rules;
}
