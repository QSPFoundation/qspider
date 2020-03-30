import React from 'react';
import { Pane, Menu } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { ObjectItem } from './object.item';

export const ObjectsPanel: React.FC = observer(({ children }) => {
  const { objects } = useGameManager();
  return (
    <Pane gridArea="objects" border="default">
      {objects.length > 0 && (
        <Menu>
          <Menu.Group>
            {objects.map((object, index) => (
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
