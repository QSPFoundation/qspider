import React, { useCallback } from 'react';
import { useGameManager } from '../../game/manager';

// TODO resolve a11ty warning
export const Link: React.FC<{ exec: string; className: string }> = ({
  exec,
  className,
  children,
}) => {
  const manager = useGameManager();
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      manager.execCode(exec);
    },
    [exec, manager]
  );
  return (
    <a href="#" className={className} onClick={onClick}>
      {children}
    </a>
  );
};
