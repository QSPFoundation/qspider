import { Attributes, globalHotKeys$, prettifyHotkeys } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';

export const QspGlobalHotkeys: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-global-hotkeys');
  const { t } = useTranslation();
  const hotkeys = useAtom(globalHotKeys$);

  return (
    <Tag style={style} {...attributes}>
      {hotkeys.map((hotkey, index) => (
        <qsp-hotkey key={index}>
          <qsp-hotkey-description>{t(hotkey.description)}</qsp-hotkey-description>
          <qsp-hotkey-keys>
            {prettifyHotkeys(hotkey.keys).map((key, index) =>
              key.type === 'key' ? <qsp-hotkey-key key={index}>{key.symbol}</qsp-hotkey-key> : key.symbol,
            )}
          </qsp-hotkey-keys>
        </qsp-hotkey>
      ))}
    </Tag>
  );
};
