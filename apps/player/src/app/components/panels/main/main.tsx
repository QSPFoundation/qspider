import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import CustomScroll from 'react-custom-scroll';
import { usePrevious } from 'react-delta';
import { PanelWithBackground, PanelContent } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const prevMain = usePrevious(manager.main);
  const [scrollTo, setScrollTo] = useState<number>(undefined);
  useEffect(() => {
    if (prevMain && manager.main !== prevMain && manager.main.startsWith(prevMain)) {
      setScrollTo((s) => (s ? s + 1 : 10000));
    } else {
      setScrollTo(undefined);
    }
  }, [prevMain, manager.main]);
  return (
    <PanelWithBackground>
      <CustomScroll heightRelativeToParent="100%" scrollTo={scrollTo}>
        <PanelContent>
          <Content content={manager.main} />
        </PanelContent>
      </CustomScroll>
    </PanelWithBackground>
  );
});
