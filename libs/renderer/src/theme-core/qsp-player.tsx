import { useAttributes } from '../content/attributes';
import { useAtom } from '@xoid/react';
import { playerTemplate$ } from '../render-state';
import { Markup } from '@qspider/html-renderer';

export const QspPlayer: React.FC = () => {
  const { attrs, template } = useAtom(playerTemplate$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-player');
  return (
    <Tag style={style} {...attributes}>
      <Markup content={template} />
    </Tag>
  );
};
