import React from 'react';
import { observer } from 'mobx-react-lite';
import { Panel } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { useLayout } from '../../../game/layout';
import { Content } from '../../content/content';

export const StatsPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  const { isStatsPanelVisible } = useLayout();
  if (!isStatsPanelVisible) return null;
  return (
    <Panel withPadding>
      <Content content={gameManager.stats} />
    </Panel>
  );
});
