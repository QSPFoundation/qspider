import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { AeroPanel } from '../aero-panel';
import { AeroActionList } from '../aero-action-list';
import { AeroCustomScroll } from '../aero-custom-scroll';
import { AeroEffect } from '../effects/aero-effect';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { useAeroLayout } from '../aero-layout';
import { noop } from '@qspider/utils';

export const AeroObjectsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isObjectPanelVisible } = useBaseLayout();
  const layout = useAeroLayout();
  const onObjectSelect = useCallback((index: number) => manager.selectObject(index), [manager]);
  if (!isObjectPanelVisible || !layout.objectsUI) return null;
  return (
    <AeroEffect
      animationKey={manager.newLocHash}
      show
      effect={layout.playerUI.newLocEffect.name}
      duration={layout.playerUI.newLocEffect.time}
      sequence={layout.playerUI.sequenceNewLocEffect}
    >
      <AeroPanel {...layout.objectsUI} data-type="object">
        <AeroCustomScroll>
          <AeroActionList
            actions={manager.objects}
            type="objectsUI"
            onSelect={noop}
            onAction={onObjectSelect}
          ></AeroActionList>
        </AeroCustomScroll>
      </AeroPanel>
    </AeroEffect>
  );
});
