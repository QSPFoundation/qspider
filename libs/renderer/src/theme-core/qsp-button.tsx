import { Attributes, GameAction, onGameAction } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspButton: React.FC<{ action: GameAction; attrs: Attributes; children: ReactNode }> = ({
  attrs,
  action,
  children,
}) => {
  const [, style, attributes] = useAttributes(attrs, 'button');
  return (
    <button style={style} {...attributes} onClick={(): void => onGameAction(action)}>
      {children}
    </button>
  );
};
