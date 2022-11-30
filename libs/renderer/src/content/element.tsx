import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from './attributes';
// import { useStyle } from '../hooks';

export interface ElementProps {
  attributes: Attributes;
  children?: React.ReactNode;
  tagName: string;
}

const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export const Element: React.FC<ElementProps> = ({ attributes = {}, children = null, tagName }) => {
  const Tag = tagName as 'span';
  const preparedAttributes = useAttributes(attributes);
  const selfClose = voidTags.includes(tagName);
  return selfClose ? <Tag {...preparedAttributes} /> : <Tag {...preparedAttributes}>{children}</Tag>;
};
