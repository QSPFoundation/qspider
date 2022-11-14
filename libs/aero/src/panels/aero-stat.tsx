import React from 'react';
import { observer } from 'mobx-react-lite';
import { AeroPanel } from '../aero-panel';
import { AeroCustomScroll } from '../aero-custom-scroll';
import { AeroEffect } from '../effects/aero-effect';
import { useBaseLayout, useGameManager, useResources } from '@qspider/providers';
import { TEXT_PLACEHOLDER, useAeroLayout } from '../aero-layout';
import { Content, hooks } from '@qspider/components';

export const AeroStatsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isStatsPanelVisible } = useBaseLayout();
  const prevStats = hooks.usePrevious(manager.stats);
  const layout = useAeroLayout();
  const resources = useResources();
  if (!isStatsPanelVisible || !layout.statsUI) return null;
  const scrollY = prevStats && manager.stats !== prevStats && manager.stats.startsWith(prevStats) ? '100%' : undefined;
  const content = layout.statsUI.format.replace(TEXT_PLACEHOLDER, manager.stats);
  return (
    <AeroEffect
      animationKey={manager.newLocHash}
      show
      effect={layout.playerUI.newLocEffect.name}
      duration={layout.playerUI.newLocEffect.time}
      sequence={layout.playerUI.sequenceNewLocEffect}
    >
      <AeroPanel
        {...(layout.statsUI || {})}
        background={layout.statsUI?.backImage && resources.get(layout.statsUI.backImage).url}
        data-type="stats"
      >
        <AeroCustomScroll scrollY={scrollY}>
          <Content content={content} />
        </AeroCustomScroll>
      </AeroPanel>
    </AeroEffect>
  );
});