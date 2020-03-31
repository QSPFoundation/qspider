import React, { useCallback } from 'react';
import { Menu } from 'evergreen-ui';
import { QspListItem } from '@qspider/qsp-wasm';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';

// todo support object image
export const ObjectItem: React.FC<{ object: QspListItem; index: number }> = ({
  object,
  index,
}) => {
  const gameManager = useGameManager();
  const onObjectSelect = useCallback(() => gameManager.selectObject(index), [
    gameManager,
    index,
  ]);
  return (
    <Menu.Item onSelect={onObjectSelect}>
      <Content content={object.name} />
    </Menu.Item>
  );
};
