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

export function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  console.log(node);
  Array.from(node.attributes).forEach((attr) => {
    console.log(attr);
    const { name, value } = attr;
    if (name === 'is') return;
    if (name === 'style') {
      attributes[name] = processStyles(value);
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      attributes[name as keyof BooleanAttributes] = true;
    } else {
      attributes[name] = value;
    }
  });
  console.log(attributes);
  return attributes;
}
