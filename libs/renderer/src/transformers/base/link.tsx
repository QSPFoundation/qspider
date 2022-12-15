import { Attributes, execCode, execSelectedAction, selectAction } from '@qspider/game-state';
import React, { useCallback } from 'react';
import { useAttributes } from '../../content/attributes';

export const Link: React.FC<{
  exec?: string;
  act?: number;
  attributes: Attributes;
  children: React.ReactNode;
}> = ({ exec, act, children, attributes }) => {
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
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a {...useAttributes(attributes, 'a')} href="#" onClick={onClick}>
      {children}
    </a>
  );
};
