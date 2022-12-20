import { Attributes, mainContent$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspMainContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const content = useAtom(mainContent$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-main-content');
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};
