import React from 'react';
import styled from '@emotion/styled';
import { ActionItem } from './action-item';
import { ActionSeparator } from './action-separator';
import { QspListItem } from '@qsp/wasm-engine';

const Nav = styled.nav`
  outline: none;
`;

export const ActionList: React.FC<{
  actions: QspListItem[];
  dataQsp: string;
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = ({ actions, dataQsp, onSelect, onAction }) => {
  return (
    <Nav role="menu" data-qsp={dataQsp}>
      {actions.map((action, index) => {
        return action.name === '-' ? (
          <ActionSeparator />
        ) : (
          <ActionItem key={index} action={action} index={index} onSelect={onSelect} onAction={onAction} />
        );
      })}
    </Nav>
  );
};
