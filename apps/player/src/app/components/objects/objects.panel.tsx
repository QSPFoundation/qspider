import React from 'react';
import { Pane, Menu } from 'evergreen-ui';

export const ObjectsPanel: React.FC = ({ children }) => {
  return (
    <Pane gridArea="objects" border="default">
      <Menu>
        <Menu.Group>{children}</Menu.Group>
      </Menu>
    </Pane>
  );
};
