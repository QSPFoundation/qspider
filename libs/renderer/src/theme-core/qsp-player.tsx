import { useThemeTemplate } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';
import { TemplateRenderer } from '../template-renderer';

export const QspPlayer: React.FC = () => {
  const { attrs, template } = useThemeTemplate('qsp_player');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-player');
  return (
    <Tag style={style} {...attributes}>
      <TemplateRenderer template={template} />
    </Tag>
  );
};
