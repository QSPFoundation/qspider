import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { AeroPanel } from '../aero-panel';
import { AeroActionList } from '../aero-action-list';
import { AeroCustomScroll } from '../aero-custom-scroll';

export const AeroObjectsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isObjectPanelVisible } = useLayout();
  const layout = useAeroLayout();
  const onObjectSelect = useCallback((index: number) => manager.selectObject(index), [manager]);
  if (!isObjectPanelVisible || !layout.objectsUI) return null;
  return (
    <AeroPanel {...layout.objectsUI}>
      <AeroCustomScroll>
        <AeroActionList actions={manager.objects} type="objectsUI" onSelect={onObjectSelect}></AeroActionList>
      </AeroCustomScroll>
    </AeroPanel>
  );
});
