import { Attributes, onLinkClicked } from '@qspider/game-state';
import React, { useCallback } from 'react';
import { useAttributes } from '../../content/attributes';

export const Area: React.FC<{
  href: string;
  attrs: Attributes;
}> = ({ href, attrs }) => {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAreaElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      onLinkClicked(href);
    },
    [href]
  );
  const [, style, attributes] = useAttributes(attrs, 'area');
  return <area {...attributes} style={style} href="#" onClick={onClick} alt=""></area>;
};
