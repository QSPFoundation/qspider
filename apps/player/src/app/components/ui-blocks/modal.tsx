import React from 'react';
import styled from '@emotion/styled';
import { Overlay } from './overlay';
import { Button } from './button';
import { WithTheme } from '../../theme.types';

const ModalContainer = styled.div<WithTheme>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;

const ModalBody = styled.div<WithTheme>`
  border: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.backgroundColor};
  font-size: ${(props) => props.theme.fontSize}pt;
  font-family: ${(props) => props.theme.fontName};
  color: ${(props) => props.theme.textColor};
  padding: 16px 16px 8px;
  border-radius: 4px;
  min-width: 400px;
  width: 650px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14),
    0px 9px 46px 8px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
  position: relative;
`;

const ModalActions = styled.div<WithTheme>`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid ${(props) => props.theme.borderColor};
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button<WithTheme>`
  color: ${(props) => props.theme.textColor};
  background: transparent;
  border: none;
  position: absolute;
  top: 0px;
  right: 0px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

export const Modal: React.FC<{ onClose: () => void; hideButtons?: boolean }> = ({ onClose, hideButtons, children }) => {
  return (
    <>
      <Overlay onClick={onClose} />
      <ModalContainer>
        <ModalBody>
          <CloseButton onClick={onClose}>x</CloseButton>
          {children}
          {!hideButtons && (
            <ModalActions>
              <Button onClick={onClose}>Ok</Button>
            </ModalActions>
          )}
        </ModalBody>
      </ModalContainer>
    </>
  );
};
