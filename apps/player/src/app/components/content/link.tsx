import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import { useLayout } from '../../game/layout';

// TODO resolve a11ty warning
export const Link: React.FC<{ exec: string; className: string }> = observer(
  ({ exec, className, children }) => {
    const manager = useGameManager();
    const { linkColor } = useLayout();
    const onClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        manager.execCode(exec);
      },
      [exec, manager]
    );
    return (
      <a
        href="#"
        className={className}
        style={{ color: linkColor }}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
);
