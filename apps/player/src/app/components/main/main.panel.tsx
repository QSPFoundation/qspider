import React from 'react';
import { Pane, Paragraph, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';

export const MainPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  return (
    <Pane
      gridArea="main"
      border="default"
      padding={minorScale(2)}
      whiteSpace="pre-wrap"
    >
      <Paragraph size={500}>{gameManager.main}</Paragraph>
    </Pane>
  );
});
