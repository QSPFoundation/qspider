import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import styled from '@emotion/styled';

const A = styled.a`
  color: ${(props) => props.theme.linkColor};
`;

export const Link: React.FC<{ exec: string; className: string }> = observer(({ exec, className, children }) => {
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
    <A href="#" className={className} onClick={onClick}>
      {children}
    </A>
  );
});
