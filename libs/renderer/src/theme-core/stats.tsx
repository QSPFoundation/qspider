import {
  Attributes,
  isStatsVisible$,
  statsContent$,
  statsScroll$,
  usePrevious,
  useQspVariable,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode, useEffect } from 'react';
import { useAttributes } from '../content/attributes';
import { scrollContext } from './scrollable';
import { ContentRenderer } from '../content-renderer';

export const QspStats: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-stats');
  const isVisible = useAtom(isStatsVisible$);
  const statsContent = useAtom(statsContent$);
  const prevStats = usePrevious(statsContent);
  const disableScroll = useQspVariable('DISABLESCROLL', '', 0, 0);

  useEffect(() => {
    if (!disableScroll) {
      if (prevStats && statsContent !== prevStats && statsContent.startsWith(prevStats)) {
        statsScroll$.update((x) => Math.max(x, 0) + 1);
      } else {
        statsScroll$.set(-1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevStats, statsContent]);

  if (!isVisible) return null;
  return (
    <scrollContext.Provider value={statsScroll$}>
      <Tag style={style} {...attributes}>
        {children}
      </Tag>
    </scrollContext.Provider>
  );
};

export const QspStatsContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-stats-content');
  const content = useAtom(statsContent$);
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};
