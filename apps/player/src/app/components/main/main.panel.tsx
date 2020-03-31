import React from 'react';
import { Pane, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';

export const MainPanel: React.FC = observer(() => {
  const gameManager = useGameManager();
  return (
    <Pane
      gridArea="main"
      border="default"
      padding={minorScale(2)}
      whiteSpace="pre-wrap"
    >
      <Content content={gameManager.main} />
    </Pane>
  );
});
