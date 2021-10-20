import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { Panel } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { ActionList } from '../../ui-blocks/action-list/action-list';
import { CustomScroll } from '../../ui-blocks/custom-scroll';

export const ActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useLayout();
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
        <ActionList actions={manager.actions} onSelect={onActionSelect} onAction={onAction}></ActionList>
      </CustomScroll>
    </Panel>
  );
});
