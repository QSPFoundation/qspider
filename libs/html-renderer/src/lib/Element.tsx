import React from 'react';
import { ElementProps } from './html-renderer.types';

export const Element: React.FC<ElementProps> = function ({
  attributes = {},
  className,
  children = null,
  selfClose = false,
  tagName,
}) {
  const Tag = tagName as 'span';

  return selfClose ? (
    <Tag className={className} {...attributes} />
  ) : (
    <Tag className={className} {...attributes}>
      {children}
    </Tag>
  );
};
