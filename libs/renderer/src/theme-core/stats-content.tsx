import { Attributes, statsContent$, TEXT_PLACEHOLDER, useFormat } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspStatsContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-stats-content');
  const content = useAtom(statsContent$);
  const format = useFormat(attributes['use-format']);
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, content) : content;
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={toRender} />
    </Tag>
  );
};
