import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrevious } from 'react-delta';
import { PanelWithBackground, PanelContent } from '../../ui-blocks/panel';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';
import { CustomScroll } from '../../ui-blocks/custom-scroll';

export const MainPanel: React.FC = observer(() => {
  const manager = useGameManager();
  const prevMain = usePrevious(manager.main);
  const [scrollY, setScrollY] = useState<string>(undefined);
  useEffect(() => {
    if (prevMain && manager.main !== prevMain && manager.main.startsWith(prevMain)) {
      setScrollY('100%');
    } else {
      setScrollY(undefined);
    }
  }, [prevMain, manager.main]);
  return (
    <PanelWithBackground>
      <CustomScroll scrollY={scrollY}>
        <PanelContent>
          <Content content={manager.main} />
        </PanelContent>
      </CustomScroll>
    </PanelWithBackground>
  );
});
