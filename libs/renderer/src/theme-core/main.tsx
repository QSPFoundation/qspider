import { Attributes, isNewLoc$, mainContent$, useQspVariable } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { ReactNode, useEffect } from 'react';
import { create } from 'xoid';
import { useAttributes } from '../content/attributes';
import { scrollContext } from './scrollable';

export const QspMain: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-main');
  const scroll$ = useSetup(() => create(0));
  const mainContent = useAtom(mainContent$);
  const isNewLoc = useAtom(isNewLoc$);
  const disableScroll = useQspVariable('DISABLESCROLL', '', 0, 0);
  useEffect(() => {
    if (!disableScroll) scroll$.update((x) => (isNewLoc ? -1 : Math.max(x, 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewLoc, mainContent]);
  return (
    <scrollContext.Provider value={scroll$}>
      <Tag style={style} {...attributes}>
        {children}
      </Tag>
    </scrollContext.Provider>
  );
};
