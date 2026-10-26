import type React from 'react';
import { fontSizeMap } from '../../content/font-sizes';

export function hrStyle(width: string | null, size: string | null, noshade: boolean): React.CSSProperties {
  return {
    borderWidth: Number(size) > 0 ? '1px' : '1px 0 0 0',
    borderStyle: noshade ? 'solid' : 'inset',
    borderColor: 'rgb(128, 128, 128)',
    borderRadius: '1px',
    height: `${size || '0'}px`,
    margin: '0.5em auto',
    width: width || '100%',
    backgroundColor: noshade ? 'rgb(128, 128, 128)' : 'transparent',
  };
}

export function tableStyle(o: {
  border: number;
  cellspacing: number;
  cellpadding: number;
  align?: React.CSSProperties['textAlign'];
  valign?: React.CSSProperties['verticalAlign'];
}): React.CSSProperties {
  return {
    textAlign: o.align ?? 'left',
    verticalAlign: o.valign ?? 'top',
    '--table-border-width': `${o.border || 0}px`,
    '--table-cellspacing': `${o.cellspacing || 0}px`,
    '--table-cellpadding': `${o.cellpadding || 0}px`,
  } as React.CSSProperties;
}

export function tableClassName(className?: string): string {
  return className ? `${className} classic-table` : 'classic-table';
}

export function fontSizeStyle(size: string | null): string {
  return size != null ? fontSizeMap[size] || 'medium' : 'inherit';
}
