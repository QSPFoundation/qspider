import { statsContent$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';

export const QspStatsContent: React.FC = () => {
  const content = useAtom(statsContent$);
  return <ContentRenderer content={content} />;
};
