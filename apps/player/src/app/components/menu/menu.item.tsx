import React, { useCallback } from 'react';
import { Menu } from 'evergreen-ui';
import { QspListItem } from '@qspider/qsp-wasm';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';

// TODO menu image
export const MenuItem: React.FC<{ menu: QspListItem; index: number }> = ({
  menu,
  index,
}) => {
  const gameManager = useGameManager();
  const onMenuSelect = useCallback(() => gameManager.selectMenu(index), [
    index,
    gameManager,
  ]);
  return (
    <Menu.Item onSelect={onMenuSelect}>
      <Content content={menu.name} />
    </Menu.Item>
  );
};
