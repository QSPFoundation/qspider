import React from 'react';
import { observer } from 'mobx-react-lite';
import CustomScroll from 'react-custom-scroll';
import { PanelWithBackground, PanelContent } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  return (
    <PanelWithBackground>
      <CustomScroll heightRelativeToParent="100%">
        <PanelContent>
          <Content content={manager.main} />
        </PanelContent>
      </CustomScroll>
    </PanelWithBackground>
  );
});
