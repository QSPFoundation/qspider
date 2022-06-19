import React from 'react';
import styled from '@emotion/styled';
import { Overlay } from './overlay';
import { Button } from './button';
import { CustomScroll } from './custom-scroll';
import { noop } from '@qspider/utils';

const ModalContainer = styled.div`
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

const ModalBody = styled.div<{ width?: number }>`
  border: 1px solid var(--border-color);
  background: var(--background-color);
  padding: 16px 16px 8px;
  border-radius: 4px;
  min-width: 400px;
  width: ${(props): number => props.width || 650}px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14),
    0px 9px 46px 8px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
  position: relative;
  display: flex;
`;

const ModalActions = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
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

const ModalContent = styled.div`
  max-width: 100%;
  width: 100%;
  max-height: 100%;
`;

export const Modal: React.FC<{
  onClose: () => void;
  closable?: boolean;
  hideButtons?: boolean;
  width?: number;
  dataQsp: string;
  children: React.ReactNode;
}> = ({ onClose, hideButtons, children, width, dataQsp, closable = true }) => {
  return (
    <>
      <Overlay onClick={closable ? onClose : noop} data-qsp={dataQsp + '-overlay'} />
      <ModalContainer data-qsp={dataQsp}>
        <ModalBody width={width}>
          {closable ? <CloseButton onClick={onClose}>x</CloseButton> : null}
          <ModalContent>
            <CustomScroll>
              {children}
              {!hideButtons && (
                <ModalActions data-qsp={dataQsp + '-buttons'}>
                  <Button onClick={onClose}>Ok</Button>
                </ModalActions>
              )}
            </CustomScroll>
          </ModalContent>
        </ModalBody>
      </ModalContainer>
    </>
  );
};
