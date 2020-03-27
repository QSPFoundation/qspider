import React from 'react';
import { Menu } from 'evergreen-ui';

export const ObjectItem: React.FC = ({ children }) => {
  return <Menu.Item>{children}</Menu.Item>;
};
