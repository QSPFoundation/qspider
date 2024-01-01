import { Attributes, currentGame$ } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';

export const QspGameHotkeys: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-game-hotkeys');
  const currentGame = useAtom(currentGame$);
  if (!currentGame) return null;
  const { hotkeys } = currentGame;
  if (!hotkeys) return null;
  console.log(hotkeys);
  return (
    <Tag style={style} {...attributes}>
      {Object.entries(hotkeys).map(([keys, description], index) => (
        <qsp-hotkey key={index}>
          <qsp-hotkey-description>{description}</qsp-hotkey-description>
          <qsp-hotkey-keys>{keys}</qsp-hotkey-keys>
        </qsp-hotkey>
      ))}
    </Tag>
  );
};
