import React from 'react';
import { observer } from 'mobx-react-lite';
import CustomScroll from 'react-custom-scroll';
import { usePrevious } from 'react-delta';
import { Panel, PanelContent } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { Content } from '../../content/content';

export const StatsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isStatsPanelVisible } = useLayout();
  const prevStats = usePrevious(manager.stats);
  if (!isStatsPanelVisible) return null;
  const scrollTo = prevStats && manager.stats !== prevStats && manager.stats.startsWith(prevStats) ? 10000 : undefined;
  return (
    <Panel>
      <CustomScroll heightRelativeToParent="100%" scrollTo={scrollTo}>
        <PanelContent>
          <Content content={manager.stats} />
        </PanelContent>
      </CustomScroll>
    </Panel>
  );
});
