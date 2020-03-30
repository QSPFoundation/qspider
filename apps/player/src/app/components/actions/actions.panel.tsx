import React from 'react';
import { Pane, Menu } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { ActionItem } from './action.item';
import { useLayout } from '../../game/layout';

export const ActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useLayout();
  if (!isActionsPanelVisible) return null;
  return (
    <Pane gridArea="actions" border="default">
      {manager.actions.length > 0 && (
        <Menu>
          <Menu.Group>
            {manager.actions.map((action, index) => (
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
