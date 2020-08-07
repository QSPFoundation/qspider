import React from 'react';
import { observer } from 'mobx-react-lite';
import { PanelWithBackground } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  return (
    <PanelWithBackground withPadding>
      <Content content={manager.main} />
    </PanelWithBackground>
  );
});
