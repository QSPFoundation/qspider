import React from 'react';
import { Pane, minorScale } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { Content } from '../content/content';
import { useLayout } from '../../game/layout';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useLayout();
  const backgroundImage = layout.backgroundImage
    ? `url(${manager.resourcePrefix}${layout.backgroundImage})`
    : 'none';
  return (
    <Pane
      gridArea="main"
      border="default"
      padding={minorScale(2)}
      whiteSpace="pre-wrap"
      backgroundImage={backgroundImage}
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      backgroundPosition="center center"
    >
      <Content content={manager.main} />
    </Pane>
  );
});
