import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrevious } from 'react-delta';
import { Panel, PanelContent } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { Content } from '../../content/content';
import { CustomScroll } from '../../ui-blocks/custom-scroll';

export const StatsPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const { isStatsPanelVisible } = useLayout();
  const prevStats = usePrevious(manager.stats);
  if (!isStatsPanelVisible) return null;
  const scrollY = prevStats && manager.stats !== prevStats && manager.stats.startsWith(prevStats) ? '100%' : undefined;
  return (
    <Panel>
      <CustomScroll scrollY={scrollY}>
        <PanelContent>
          <Content content={manager.stats} />
        </PanelContent>
      </CustomScroll>
    </Panel>
  );
});
