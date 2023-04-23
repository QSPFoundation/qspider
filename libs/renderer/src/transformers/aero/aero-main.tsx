import { Attributes, TEXT_PLACEHOLDER, mainContent$, useFormatVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { ContentRenderer } from '../../content-renderer';

export const AeroQspMainContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
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
