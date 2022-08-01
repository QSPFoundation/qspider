import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '@qspider/providers';
import { PanelContent, PanelWithBackground } from '../panel';
import { Content, CustomScroll, hooks } from '@qspider/components';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const prevMain = hooks.usePrevious(manager.main);
  const [scrollY, setScrollY] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (prevMain && manager.main !== prevMain && manager.main.startsWith(prevMain)) {
      setScrollY('100%');
    } else {
      setScrollY(undefined);
    }
  }, [prevMain, manager.main]);
  return (
    <PanelWithBackground data-qsp="main">
      <CustomScroll scrollY={scrollY}>
        <PanelContent>
          <Content content={manager.main} />
        </PanelContent>
      </CustomScroll>
    </PanelWithBackground>
  );
});
