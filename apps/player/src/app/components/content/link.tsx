import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import styled from '@emotion/styled';
import { useStyle } from '../../hooks/style';

const StyledA = styled.a`
  color: ${(props) => props.theme.linkColor};
`;

export const Link: React.FC<{ exec?: string; act?: number; className: string; style: React.CSSProperties }> = observer(
  ({ exec, act, className, style, children }) => {
    const manager = useGameManager();
    const onClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (exec) {
          manager.execCode(exec);
        } else if (act) {
          manager.selectAction(act - 1);
          manager.executeSelAction();
        }
      },
      [exec, act, manager]
    );
    return (
      <StyledA href="#" className={className} onClick={onClick} style={useStyle(style)}>
        {children}
      </StyledA>
    );
  }
);

export const A: React.FC<{ href?: string; className?: string; style: React.CSSProperties }> = ({
  style,
  className,
  href,
  children,
}) => {
  return (
    <StyledA href={href} style={useStyle(style)} className={className}>
      {children}
    </StyledA>
  );
};
