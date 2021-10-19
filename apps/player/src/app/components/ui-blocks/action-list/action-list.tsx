import React from 'react';
import styled from '@emotion/styled';
import { QspListItem } from '@qspider/qsp-wasm';
import { ActionItem } from './action-item';

const Nav = styled.nav`
  outline: none;
`;

export const ActionList: React.FC<{
  actions: QspListItem[];
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = ({ actions, onSelect, onAction }) => {
  return (
    <Nav role="menu">
      {actions.map((action, index) => {
        return <ActionItem key={index} action={action} index={index} onSelect={onSelect} onAction={onAction} />;
      })}
    </Nav>
  );
};
