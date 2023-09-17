import { currentThemeData$ } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';
import { useAtom } from '@xoid/react';

export const QspPlayer: React.FC = () => {
  const theme = useAtom(currentThemeData$);
  const player = theme['qsp_player'] ?? { template: '', attrs: {} };
  const { attrs, template } = player;
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-player');
  if (!player.template) return 'No qsp-player in theme defined';
  return (
    <Tag style={style} {...attributes}>
      <TemplateRenderer template={template} />
    </Tag>
  );
};
