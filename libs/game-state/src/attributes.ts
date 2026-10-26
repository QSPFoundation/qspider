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
  onWheel?: (e: WheelEvent) => void;
  onSubmit?: (e: Event) => void;
};
export type Attributes = {
  style?: React.CSSProperties;
} & BooleanAttributes & {
    [attr: string]: AttributeValue;
  } & EventAttributes;

const SCRIPT_SCHEMES = ['javascript:', 'vbscript:', 'livescript:'];
const BLOCKED_HREF_SCHEMES = [...SCRIPT_SCHEMES, 'data:'];

/**
 * The value as the browser reads its scheme, lowercased: browsers ignore leading spaces and control characters
 * and drop tabs and newlines inside a URL (` java\tscript:` runs), so every char up to U+0020 is removed.
 */
const schemeView = (value: string): string =>
  Array.from(value)
    .filter((char) => char.charCodeAt(0) > 0x20)
    .join('')
    .toLowerCase();

const blockSchemes =
  (blocked: string[], replacement: string) =>
  (value: string): string => {
    const scheme = schemeView(value);
    return blocked.some((prefix) => scheme.startsWith(prefix)) ? replacement : value;
  };

// The player's own guard: React sanitises only some props (not lowercase formaction) and only javascript:.
const neutraliseLink = blockSchemes(BLOCKED_HREF_SCHEMES, '#');

const valueProcessors: Record<string, (value: string) => string> = {
  href: neutraliseLink,
  formaction: neutraliseLink,
  action: neutraliseLink,
  'xlink:href': neutraliseLink,
  // Games use data: images, so src keeps data: and blocks only the script schemes.
  src: blockSchemes(SCRIPT_SCHEMES, 'about:blank'),
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
      attributes[name] = Object.prototype.hasOwnProperty.call(valueProcessors, name)
        ? valueProcessors[name](value)
        : value;
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
