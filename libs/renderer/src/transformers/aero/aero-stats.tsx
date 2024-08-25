import { Attributes } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { Markup } from '@qspider/html-renderer';
import { aeroParsedStatsContent$ } from '../../render-state';

export const AeroQspStatsContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-stats-content');
  const { content, key } = useAtom(aeroParsedStatsContent$);
  return (
    <Tag style={style} {...attributes} key={key}>
      <Markup content={content} />
    </Tag>
  );
};
