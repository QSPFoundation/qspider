import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrevious } from 'react-delta';
import { useBaseLayout, useGameManager } from '@qspider/providers';
import { Panel, PanelContent } from '../panel';
import { Content, CustomScroll } from '@qspider/components';

export const StatsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isStatsPanelVisible } = useBaseLayout();
  const prevStats = usePrevious(manager.stats);
  if (!isStatsPanelVisible) return null;
  const scrollY = prevStats && manager.stats !== prevStats && manager.stats.startsWith(prevStats) ? '100%' : undefined;
  return (
    <Panel data-qsp="stats">
      <CustomScroll scrollY={scrollY}>
        <PanelContent>
          <Content content={manager.stats} />
        </PanelContent>
      </CustomScroll>
    </Panel>
  );
});
