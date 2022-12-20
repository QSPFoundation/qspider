import { Attributes, execCode, execSelectedAction, selectAction } from '@qspider/game-state';
import React, { useCallback } from 'react';
import { useAttributes } from '../../content/attributes';

export const Link: React.FC<{
  exec?: string;
  act?: number;
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ exec, act, children, attrs }) => {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      if (exec) {
        execCode(exec);
      } else if (act) {
        selectAction(act - 1);
        execSelectedAction();
      }
    },
    [exec, act]
  );
  const [, style, attributes] = useAttributes(attrs, 'a');
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a {...attributes} style={style} href="#" onClick={onClick}>
      {children}
    </a>
  );
};
