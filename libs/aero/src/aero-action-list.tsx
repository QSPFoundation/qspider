import React from 'react';
import styled from '@emotion/styled';
import { AeroActionItem } from './aero-action-item';
import { AeroActionSeparator } from './aero-action-separator';
import { QspListItem } from '@qsp/wasm-engine';

const Nav = styled.nav`
  outline: none;
`;

const IntegratedWrapper = styled.div`
  padding-top: 20px;
`;

export const AeroActionList: React.FC<{
  actions: QspListItem[];
  type: 'actionsUI' | 'objectsUI' | 'menuUI';
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = ({ actions, type, onSelect, onAction }) => {
  return (
    <Nav role="menu">
      {actions.map((action, index) => {
        return action.name === '-' ? (
          <AeroActionSeparator />
        ) : (
          <AeroActionItem
            key={index}
            action={action}
            index={index}
            type={type}
            onSelect={onSelect}
            onAction={onAction}
          />
        );
      })}
    </Nav>
  );
};

export const IntegratedAeroActionList: React.FC<{
  actions: QspListItem[];
  type: 'actionsUI' | 'objectsUI' | 'menuUI';
  onSelect: (index: number) => void;
  onAction: (index: number) => void;
}> = (props) => {
  return (
    <IntegratedWrapper>
      <AeroActionList {...props} />
    </IntegratedWrapper>
  );
};