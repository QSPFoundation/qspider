import React, { useCallback, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { ActionList } from '../ui-blocks/action-list/action-list';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export const Menu: React.FC = observer(() => {
  const manager = useGameManager();
  const coordinates = useClickCoordinates();
  const node = useOutsideClick(() => manager.selectMenu(-1));

  const onMenuSelect = useCallback(
    (index: number) => manager.selectMenu(index),
    [manager]
  );
  if (!manager.isMenuShown) return null;

  return (
    <div
      ref={node}
      style={{
        position: 'absolute',
        top: coordinates.y,
        left: coordinates.x,
      }}
    >
      <ActionList actions={manager.menu} onSelect={onMenuSelect} />
    </div>
  );
});
