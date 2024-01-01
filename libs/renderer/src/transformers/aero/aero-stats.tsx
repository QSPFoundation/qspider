import { Attributes, TEXT_PLACEHOLDER, statsContent$, useFormatVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { ContentRenderer } from '../../content-renderer';

export const AeroQspStatsContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-stats-content');
  const content = useAtom(statsContent$);
  const format = useFormatVariable(useFormat);
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, content) : content;
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={toRender} />
    </Tag>
  );
};
