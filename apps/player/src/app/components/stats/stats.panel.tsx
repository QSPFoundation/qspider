import React from 'react';
import { Pane, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useLayout } from '../../game/layout';
import { Content } from '../content/content';

export const StatsPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  const { isStatsPanelVisible } = useLayout();
  if (!isStatsPanelVisible) return null;
  return (
    <Pane gridArea="stats" border="default" padding={minorScale(2)}>
      <Content content={gameManager.stats} />
    </Pane>
  );
});
