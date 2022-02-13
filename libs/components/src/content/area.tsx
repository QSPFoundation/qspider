import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '@qspider/providers';
import { Attributes, useAttributes } from '../hooks/attributes';

export const Area: React.FC<{
  className?: string;
  shape?: string;
  coords?: string;
  href: string;
  attributes: Attributes;
}> = observer(({ href, shape, coords, attributes, className }) => {
  const manager = useGameManager();
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAreaElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      manager.onLinkClicked(href);
    },
    [href, manager]
  );
  return (
    <area
      {...useAttributes(attributes)}
      className={className}
      href="#"
      shape={shape}
      coords={coords}
      onClick={onClick}
      alt=""
    ></area>
  );
});
