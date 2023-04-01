import React from 'react';
import { processStyles } from './css';

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

export type Attributes = {
  style?: React.CSSProperties;
} & BooleanAttributes & {
    [attr: string]: AttributeValue;
  };

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
      attributes[name] = processStyles(value);
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      attributes[name as keyof BooleanAttributes] = true;
    } else {
      attributes[name] = name in valueProcessors ? valueProcessors[name](value) : value;
    }
  });
  return attributes;
}
