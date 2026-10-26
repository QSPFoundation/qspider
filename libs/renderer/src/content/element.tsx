import { Attributes } from '@qspider/game-state';
import React from 'react';
import { bindAttributes } from './attributes';
import { convertAttributes } from './convert-attributes';
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
  // The tag a tag= attribute resolves to, not the parsed one, decides the drop and the void form.
  const converted = convertAttributes(attrs, tagName);
  if (converted.dropped) return null;
  const [Tag, style, attributes] = bindAttributes<keyof React.JSX.IntrinsicElements>(converted);
  const selfClose = voidTags.includes(converted.tag);
  return selfClose ? (
    <Tag style={style} {...attributes} />
  ) : (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};
