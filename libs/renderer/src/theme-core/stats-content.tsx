import { Attributes, statsContent$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspStatsContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-stats-content');
  const content = useAtom(statsContent$);
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};
