import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useLayout } from '../../../game/layout';
import { useGameManager } from '../../../game/manager';
import { Panel } from '../../ui-blocks/panel';
import { ActionList } from '../../ui-blocks/action-list/action-list';
import { CustomScroll } from '../../ui-blocks/custom-scroll';
import { noop } from '../../../utils';

export const ObjectsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isObjectPanelVisible } = useLayout();
  const onObjectSelect = useCallback((index: number) => manager.selectObject(index), [manager]);
  if (!isObjectPanelVisible) return null;
  return (
    <Panel>
      <CustomScroll>
        <ActionList actions={manager.objects} onSelect={noop} onAction={onObjectSelect} />
      </CustomScroll>
    </Panel>
  );
});
