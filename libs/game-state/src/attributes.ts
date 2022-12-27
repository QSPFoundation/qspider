import React from 'react';
import { processStyles } from './css';

export type AttributeValue = string;

export type Attributes = {
  style?: React.CSSProperties;
} & {
  [attr: string]: AttributeValue;
};

export function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  Array.from(node.attributes).forEach((attr) => {
    const { name, value } = attr;
    if (name === 'is') return;
    if (name === 'style') {
      attributes[name] = processStyles(value);
    } else {
      attributes[name] = value;
    }
  });
  return attributes;
}
