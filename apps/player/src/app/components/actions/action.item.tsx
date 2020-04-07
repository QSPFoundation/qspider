import React, { useCallback } from 'react';
import { Menu, Pane } from 'evergreen-ui';
import { QspListItem } from '@qspider/qsp-wasm';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';

// TODO action image
export const ActionItem: React.FC<{
  action: QspListItem;
  index: number;
}> = observer(({ action, index }) => {
  const gameManager = useGameManager();
  const onActionSelect = useCallback(() => gameManager.selectAction(index), [
    index,
    gameManager,
  ]);
  const { color } = useLayout();
  return (
    <Menu.Item onSelect={onActionSelect}>
      <Pane color={color}>
        <Content content={action.name} />
      </Pane>
    </Menu.Item>
  );
});
