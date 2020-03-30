import React from 'react';
import { Pane, minorScale, Paragraph } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useLayout } from '../../game/layout';

export const StatsPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  const { isStatsPanelVisible } = useLayout();
  if (!isStatsPanelVisible) return null;
  return (
    <Pane gridArea="stats" border="default" padding={minorScale(2)}>
      <Paragraph size={500}>{gameManager.stats}</Paragraph>
    </Pane>
  );
});
