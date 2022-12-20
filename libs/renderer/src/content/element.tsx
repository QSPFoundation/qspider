import { Attributes } from '@qspider/game-state';
import React from 'react';
import { useAttributes } from './attributes';
// import { useStyle } from '../hooks';

export interface ElementProps {
  attrs: Attributes;
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

export const Element: React.FC<ElementProps> = ({ attrs = {}, children = null, tagName }) => {
  const [Tag, style, attributes] = useAttributes(attrs, tagName as keyof JSX.IntrinsicElements);
  const selfClose = voidTags.includes(tagName);
  return selfClose ? (
    <Tag style={style} {...attributes} />
  ) : (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};
