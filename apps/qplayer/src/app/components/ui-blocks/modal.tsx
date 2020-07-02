import React from 'react';
import styled from '@emotion/styled';
import { Overlay } from './overlay';
import { Button } from './button';
import { WithTheme } from '../../theme.types';

const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ModalBody = styled.div<WithTheme>`
  border: 1px solid ${(props) => props.theme.borderColor};
  padding: 8px;
  border-radius: 4px;
  min-width: 400px;
  max-width: 90vw;
`;

const ModalActions = styled.div<WithTheme>`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid ${(props) => props.theme.borderColor};
  display: flex;
  justify-content: flex-end;
`;

export const Modal: React.FC<{ onClose: () => void }> = ({
  onClose,
  children,
}) => {
  return (
    <>
      <Overlay onClick={onClose} />
      <ModalContainer>
        <ModalBody>
          {children}
          <ModalActions>
            <Button onClick={onClose}>Ok</Button>
          </ModalActions>
        </ModalBody>
      </ModalContainer>
    </>
  );
};
