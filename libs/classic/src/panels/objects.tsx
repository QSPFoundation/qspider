import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { Panel } from '../panel';
import { CustomScroll } from '@qspider/components';
import { ActionList } from '../action-list/action-list';
import { noop } from '@qspider/utils';

export const ObjectsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isObjectPanelVisible } = useBaseLayout();
  const onObjectSelect = useCallback((index: number) => manager.selectObject(index), [manager]);
  if (!isObjectPanelVisible) return null;
  return (
    <Panel data-qsp="objects">
      <CustomScroll>
        <ActionList actions={manager.objects} onSelect={noop} onAction={onObjectSelect} dataQsp="objects-list" />
      </CustomScroll>
    </Panel>
  );
});
