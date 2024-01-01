import { Attributes, muted$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';

export const QspMuteToggle: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [t] = useTranslation();
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-mute-toggle');
  const isMuted = useAtom(muted$);

  return (
    <Tag role="button" style={style} {...attributes} onClick={(): void => muted$.update((isMuted) => !isMuted)}>
      {isMuted ? t('Unmute') : t('Mute')}
    </Tag>
  );
};
