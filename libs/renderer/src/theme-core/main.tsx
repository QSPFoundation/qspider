import { Attributes, isNewLoc$, mainContent$, mainScroll$, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode, useEffect } from 'react';
import { useAttributes } from '../content/attributes';
import { scrollContext } from './scrollable';
import { ContentRenderer } from '../content-renderer';

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
  const content = useAtom(mainContent$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-main-content');
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};
