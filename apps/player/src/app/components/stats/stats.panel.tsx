import React from 'react';
import { Pane, minorScale, Paragraph } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';

export const StatsPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  return (
    <Pane gridArea="stats" border="default" padding={minorScale(2)}>
      <Paragraph size={500}>{gameManager.stats}</Paragraph>
    </Pane>
  );
});
