import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Panel } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { ActionList } from '../../ui-blocks/action-list/action-list';

export const ActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useLayout();
  const onActionSelect = useCallback(
    (index: number) => manager.selectAction(index),
    [manager]
  );
  if (!isActionsPanelVisible) return null;
  return (
    <Panel gridArea="actions">
      <ActionList
        actions={manager.actions}
        onSelect={onActionSelect}
      ></ActionList>
    </Panel>
  );
});
