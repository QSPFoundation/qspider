import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrevious } from 'react-delta';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';
import { AeroPanel } from '../aero-panel';
import { useResources } from '../../../game/resource-manager';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { TEXT_PLACEHOLDER } from '@qspider/qsp-wasm';
import { AeroActionsPanel } from './aero-actions';
import { AeroCustomScroll } from '../aero-custom-scroll';
import { AeroEffect } from '../effects/aero-effect';

export const AeroMainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const prevMain = usePrevious(manager.main);
  const [scrollY, setScrollY] = useState<string>(undefined);
  const [isNewLoc, setIsNewLoc] = useState<boolean>(true);
  useEffect(() => {
    if (prevMain && manager.main !== prevMain && manager.main.startsWith(prevMain)) {
      setScrollY('100%');
      setIsNewLoc(false);
    } else {
      setScrollY(undefined);
      setIsNewLoc(true);
    }
  }, [prevMain, manager.main]);
  const resources = useResources();
  const layout = useAeroLayout();
  if (!layout.mainUI) return null;
  const content = layout.mainUI.format.replace(TEXT_PLACEHOLDER, manager.main);
  const main = (
    <AeroPanel {...layout.mainUI} background={layout.mainUI.backImage && resources.get(layout.mainUI.backImage).url}>
      <AeroCustomScroll scrollY={scrollY}>
        <Content content={content} />
        {layout.playerUI.intergratedActions && <AeroActionsPanel />}
      </AeroCustomScroll>
    </AeroPanel>
  );
  if (isNewLoc) {
    return (
      <AeroEffect
        show
        effect={layout.playerUI.newLocEffect.name}
        duration={layout.playerUI.newLocEffect.time}
        onEffectEnd={() => setIsNewLoc(false)}
      >
        {main}
      </AeroEffect>
    );
  }
  return main;
});
