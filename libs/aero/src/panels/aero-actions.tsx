import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { AeroPanel } from '../aero-panel';
import { AeroActionList, IntegratedAeroActionList } from '../aero-action-list';
import { AeroCustomScroll } from '../aero-custom-scroll';
import { AeroEffect } from '../effects/aero-effect';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { useAeroLayout } from '../aero-layout';

export const AeroActionsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isActionsPanelVisible } = useBaseLayout();
  const layout = useAeroLayout();
  const onActionSelect = useCallback((index: number) => manager.selectAction(index), [manager]);
  const onAction = useCallback(
    (index) => {
      manager.selectAction(index);
      manager.executeSelAction();
    },
    [manager]
  );
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
    <AeroEffect
      animationKey={manager.newLocHash}
      show
      effect={layout.playerUI.newLocEffect.name}
      duration={layout.playerUI.newLocEffect.time}
      sequence={layout.playerUI.sequenceNewLocEffect}
    >
      <AeroPanel {...layout.actionsUI} data-type="actions">
        <AeroCustomScroll>
          <AeroActionList
            actions={manager.actions}
            type="actionsUI"
            onSelect={onActionSelect}
            onAction={onAction}
          ></AeroActionList>
        </AeroCustomScroll>
      </AeroPanel>
    </AeroEffect>
  );
});
