import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { CustomScroll } from '@qspider/components';
import { ActionList } from '../action-list/action-list';
import { Panel } from '../panel';

export const ActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useBaseLayout();
  const onActionSelect = useCallback((index: number) => manager.selectAction(index), [manager]);
  const onAction = useCallback(
    (index) => {
      manager.selectAction(index);
      manager.executeSelAction();
    },
    [manager]
  );
  if (!isActionsPanelVisible) return null;
  return (
    <Panel data-qsp="actions">
      <CustomScroll>
        <ActionList
          actions={manager.actions}
          onSelect={onActionSelect}
          onAction={onAction}
          dataQsp="actions-list"
        ></ActionList>
      </CustomScroll>
    </Panel>
  );
});
