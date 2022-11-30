import { useThemeTemplate } from '@qspider/game-state';
import { TemplateRenderer } from '../template-renderer';

export const QspPlayer: React.FC = () => {
  const { attrs, template } = useThemeTemplate('qsp_player');
  return (
    <qsp-player {...attrs}>
      <TemplateRenderer template={template} />
    </qsp-player>
  );
};
