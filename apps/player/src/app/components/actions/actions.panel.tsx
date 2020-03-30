import React from 'react';
import { Pane, Menu } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { ActionItem } from './action.item';

export const ActionsPanel: React.FC = observer(() => {
  const { actions } = useGameManager();
  return (
    <Pane gridArea="actions" border="default">
      {actions.length > 0 && (
        <Menu>
          <Menu.Group>
            {actions.map((action, index) => (
              <ActionItem
                key={index}
                action={action}
                index={index}
              ></ActionItem>
            ))}
          </Menu.Group>
        </Menu>
      )}
    </Pane>
  );
});
