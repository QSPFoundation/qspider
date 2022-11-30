import { mainContent$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';

export const QspMainContent: React.FC = () => {
  const content = useAtom(mainContent$);
  return <ContentRenderer content={content} />;
};
