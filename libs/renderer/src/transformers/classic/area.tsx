import { Attributes, onLinkClicked } from '@qspider/game-state';
import React, { useCallback } from 'react';
import { useAttributes } from '../../content/attributes';

export const Area: React.FC<{
  href: string;
  attributes: Attributes;
}> = ({ href, attributes }) => {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAreaElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      onLinkClicked(href);
    },
    [href]
  );
  return <area {...useAttributes(attributes, 'area')} href="#" onClick={onClick} alt=""></area>;
};
