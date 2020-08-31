import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';

export const Area: React.FC<{ shape: string; coords: string; href: string }> = observer(({ href, shape, coords }) => {
  const manager = useGameManager();
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAreaElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      if (href.toLowerCase().startsWith('exec:')) {
        manager.execCode(href.substr(5));
      } else {
        window.location.href = href;
      }
    },
    [href, manager]
  );
  return <area href="#" shape={shape} coords={coords} onClick={onClick} alt=""></area>;
});
