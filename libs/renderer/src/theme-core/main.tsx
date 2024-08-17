import {
  Attributes,
  isNewLoc$,
  mainContent$,
  mainScroll$,
  newLocHash$,
  nextMainContent$,
  useQspVariable,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode, useEffect } from 'react';
import { useAttributes } from '../content/attributes';
import { scrollContext } from './scrollable';
import { Markup } from '@qspider/html-renderer';
import { parsedMainContent$ } from '../render-state';

export const QspMain: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-main');
  const mainContent = useAtom(mainContent$);
  const isNewLoc = useAtom(isNewLoc$);
  const disableScroll = useQspVariable('DISABLESCROLL', '', 0, 0);
  useEffect(() => {
    if (!disableScroll) mainScroll$.update((x) => (isNewLoc ? -1 : Math.max(x, 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewLoc, mainContent]);
  return (
    <scrollContext.Provider value={mainScroll$}>
      <Tag style={style} {...attributes}>
        {children}
      </Tag>
    </scrollContext.Provider>
  );
};

export const QspMainContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const content = useAtom(parsedMainContent$);
  const newLocHash = useAtom(newLocHash$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-main-content');
  useEffect(() => {
    mainContent$.set(nextMainContent$.value);
  }, [newLocHash]);
  return (
    <Tag style={style} {...attributes}>
      <Markup content={content} />
    </Tag>
  );
};
