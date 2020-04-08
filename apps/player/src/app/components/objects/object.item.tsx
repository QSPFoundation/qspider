import React, { useCallback } from 'react';
import { Menu, Pane } from 'evergreen-ui';
import { QspListItem } from '@qspider/qsp-wasm';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';
import { useLayout } from '../../game/layout';
import { observer } from 'mobx-react-lite';

// todo support object image
export const ObjectItem: React.FC<{
  object: QspListItem;
  index: number;
}> = observer(({ object, index }) => {
  const gameManager = useGameManager();
  const onObjectSelect = useCallback(() => gameManager.selectObject(index), [
    gameManager,
    index,
  ]);
  const { color } = useLayout();
  return (
    <Menu.Item onSelect={onObjectSelect}>
      <Pane color={color}>
        {object.image && (
          <img
            src={`${gameManager.resourcePrefix}${object.image}`}
            alt={object.name}
          />
        )}
        <Content content={object.name} />
      </Pane>
    </Menu.Item>
  );
});
