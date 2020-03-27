import React from 'react';
import { Pane, Menu } from 'evergreen-ui';

export const ActionsPanel: React.FC = ({ children }) => {
  return (
    <Pane gridArea="actions" border="default">
      <Menu>
        <Menu.Group>{children}</Menu.Group>
      </Menu>
    </Pane>
  );
};
