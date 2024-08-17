import { Attributes } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { Markup } from '@qspider/html-renderer';
import { aeroParsedMainContent$ } from '../../render-state';

export const AeroQspMainContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const content = useAtom(aeroParsedMainContent$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-main-content');
  return (
    <Tag style={style} {...attributes}>
      <Markup content={content} />
    </Tag>
  );
};
