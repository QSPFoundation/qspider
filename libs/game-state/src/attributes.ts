import React from 'react';

export type AttributeValue = string;

const BOOLEAN_ATTRIBUTES = new Set([
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'disabled',
  'formnovalidate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'novalidate',
  'open',
  'readonly',
  'required',
  'reversed',
  'selected',
]);

type BooleanAttributes = {
  autofocus?: boolean;
  autoplay?: boolean;
  checked?: boolean;
  controls?: boolean;
  default?: boolean;
  disabled?: boolean;
  formnovalidate?: boolean;
  inert?: boolean;
  ismap?: boolean;
  itemscope?: boolean;
  loop?: boolean;
  multiple?: boolean;
  muted?: boolean;
  novalidate?: boolean;
  open?: boolean;
  readonly?: boolean;
  required?: boolean;
  reversed?: boolean;
  selected?: boolean;
};

export type EventAttributes = {
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  onDoubleClick?: (e: MouseEvent) => void;
};
export type Attributes = {
  style?: React.CSSProperties;
} & BooleanAttributes & {
    [attr: string]: AttributeValue;
  } & EventAttributes;

const valueProcessors: Record<string, (value: string) => string> = {
  href(value: string) {
    // eslint-disable-next-line no-script-url
    if (value.startsWith('javascript:')) return '#';
    return value;
  },
};

export function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  Array.from(node.attributes).forEach((attr) => {
    const { name, value } = attr;
    if (name === 'is') return;
    if (name === 'style') {
      attributes['style'] = processStyles(value);
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      attributes[name as keyof BooleanAttributes] = true;
    } else {
      attributes[name] = name in valueProcessors ? valueProcessors[name](value) : value;
    }
  });
  return attributes;
}

function processStyles(value: string): Record<string, string | number> {
  const rules = value.split(';');
  const style: Record<string, string | number> = {};
  for (const rule of rules) {
    const [prop, value] = rule.trim().split(':');
    const name = prop.replace(/^-ms-/, 'ms-').replace(/-./g, (c) => c.substring(1).toUpperCase());
    let preparedValue: string | number = value;
    if (name === 'backgroundImage' && !value.includes('url(')) {
      preparedValue = `url("${value}")`;
    } else if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
      preparedValue = parseFloat(value);
    }
    style[name] = preparedValue;
  }
  return style;
}
