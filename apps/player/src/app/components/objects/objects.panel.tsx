import React from 'react';
import { Pane, Menu } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { ObjectItem } from './object.item';
import { useLayout } from '../../game/layout';

export const ObjectsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isObjectPanelVisible } = useLayout();
  if (!isObjectPanelVisible) return null;
  return (
    <Pane gridArea="objects" border="default">
      {manager.objects.length > 0 && (
        <Menu>
          <Menu.Group>
            {manager.objects.map((object, index) => (
              <ObjectItem
                key={index}
                object={object}
                index={index}
              ></ObjectItem>
            ))}
          </Menu.Group>
        </Menu>
      )}
    </Pane>
  );
});
