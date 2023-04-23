import { Attributes, mainContent$, TEXT_PLACEHOLDER, useFormatVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspMainContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const content = useAtom(mainContent$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-main-content');
  const format = useFormatVariable(useFormat);
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, content) : content;
  return (
    <Tag style={style} {...attributes}>
      <ContentRenderer content={toRender} />
    </Tag>
  );
};
