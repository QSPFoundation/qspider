import React from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { AeroActionItem } from './aero-action-item';

const Nav = styled.nav`
  outline: none;
`;

export const AeroActionList: React.FC<{
  actions: QspListItem[];
  type: 'actionsUI' | 'objectsUI' | 'menuUI';
  onSelect: (index: number) => void;
}> = ({ actions, type, onSelect }) => {
  return (
    <Nav role="menu">
      {actions.map((action, index) => {
        return <AeroActionItem key={index} action={action} index={index} type={type} onSelect={onSelect} />;
      })}
    </Nav>
  );
};
