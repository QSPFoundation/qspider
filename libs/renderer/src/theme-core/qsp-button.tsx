import { Attributes, GameAction, onGameAction } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspButton: React.FC<{ action: GameAction; attributes: Attributes; children: ReactNode }> = ({
  attributes,
  action,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes);
  return (
    <button {...preparedAttributes} onClick={(): void => onGameAction(action)}>
      {children}
    </button>
  );
};
