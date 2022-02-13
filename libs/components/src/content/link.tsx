import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import { useStyle } from '../hooks';
import { Attributes, useAttributes } from '../hooks/attributes';

const StyledA = styled.a`
  color: var(--link-color);
`;

export const Link: React.FC<{
  exec?: string;
  act?: number;
  className?: string;
  style: React.CSSProperties;
  attributes: Attributes;
}> = observer(({ exec, act, className, style, children, attributes }) => {
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
    <StyledA {...useAttributes(attributes)} href="#" className={className} onClick={onClick} style={useStyle(style)}>
      {children}
    </StyledA>
  );
});

export const A: React.FC<{ href?: string; className?: string; style: React.CSSProperties; attributes: Attributes }> = ({
  style,
  className,
  href,
  children,
  attributes,
}) => {
  return (
    <StyledA {...useAttributes(attributes)} href={href} style={useStyle(style)} className={className}>
      {children}
    </StyledA>
  );
};
