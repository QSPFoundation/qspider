import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';
import styled from '@emotion/styled';
import { WithTheme } from '../../theme.types';
import { useStyle } from '../../hooks/style';

const StyledA = styled.a<WithTheme>`
  color: ${(props) => props.theme.linkColor};
`;

export const Link: React.FC<{ exec: string; className: string; style: React.CSSProperties }> = observer(
  ({ exec, className, style, children }) => {
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
    <A href={href} style={useStyle(style)} className={className}>
      {children}
    </A>
  );
};
