import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { AeroPanel } from '../aero-panel';
import { AeroActionList, IntegratedAeroActionList } from '../aero-action-list';
import { AeroCustomScroll } from '../aero-custom-scroll';

export const AeroActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useLayout();
  const layout = useAeroLayout();
  const onActionSelect = useCallback((index: number) => manager.selectAction(index), [manager]);
  const onAction = useCallback(() => manager.executeSelAction(), [manager]);
  if (!isActionsPanelVisible || !layout.actionsUI) return null;
  if (layout.playerUI.intergratedActions) {
    return (
      <IntegratedAeroActionList
        actions={manager.actions}
        type="actionsUI"
        onSelect={onActionSelect}
        onAction={onAction}
      ></IntegratedAeroActionList>
    );
  }
  return (
    <AeroPanel {...layout.actionsUI}>
      <AeroCustomScroll>
        <AeroActionList
          actions={manager.actions}
          type="actionsUI"
          onSelect={onActionSelect}
          onAction={onAction}
        ></AeroActionList>
      </AeroCustomScroll>
    </AeroPanel>
  );
});
