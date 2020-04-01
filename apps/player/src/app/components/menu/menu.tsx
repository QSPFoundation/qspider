import React, { useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { Popover, Position, Menu as MenuUI, Button } from 'evergreen-ui';
import { MenuItem } from './menu.item';

export const Menu: React.FC = observer(() => {
  const manager = useGameManager();
  const coordinates = useClickCoordinates();
  const ref = useRef<Popover & { open: () => void; close: () => void }>();

  const onClose = useCallback(() => {
    if (manager.isMenuShown) {
      manager.selectMenu(-1);
    }
  }, [manager]);

  useEffect(() => {
    if (manager.isMenuShown) {
      ref.current.open();
    } else {
      ref.current.close();
    }
  }, [manager.isMenuShown]);

  return (
    <Popover
      ref={ref}
      position={Position.BOTTOM_LEFT}
      content={
        manager.menu.length ? (
          <MenuUI>
            {manager.menu.map((menuItem, index) => (
              <MenuItem key={index} menu={menuItem} index={index} />
            ))}
          </MenuUI>
        ) : (
          ''
        )
      }
      onCloseComplete={onClose}
    >
      <Button
        style={{
          height: 0,
          opacity: 0,
          position: 'absolute',
          top: coordinates.y,
          left: coordinates.x,
        }}
      ></Button>
    </Popover>
  );
});
