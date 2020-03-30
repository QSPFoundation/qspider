import React, { useCallback } from 'react';
import { Menu } from 'evergreen-ui';
import { QspListItem } from '@qspider/qsp-wasm';
import { useGameManager } from '../../game/manager';

// TODO action image
export const ActionItem: React.FC<{ action: QspListItem; index: number }> = ({
  action,
  index,
}) => {
  const gameManager = useGameManager();
  const onActionSelect = useCallback(() => gameManager.selectAction(index), [
    index,
    gameManager,
  ]);
  return <Menu.Item onSelect={onActionSelect}>{action.name}</Menu.Item>;
};
